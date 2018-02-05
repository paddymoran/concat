from flask import (
    Flask, request, redirect, send_file, jsonify, session, abort, url_for,
    send_from_directory, Response, render_template, make_response, Blueprint,
    current_app,
)
from io import BytesIO
from subprocess import Popen, STDOUT
import uuid
import tempfile
from sign import sign, concat
import db
from copy import deepcopy
from base64 import b64decode
from urllib.parse import urlparse
import zipfile
from dateutil.parser import parse
import json
from utils import login_redirect, protected, nocache, fullcache, InvalidUsage, catalex_protected
import requests
from werkzeug.exceptions import HTTPException
from uuid import uuid4
import requests

api = Blueprint('api', __name__)


ALLOWED_PDF_MIME_TYPES = [
    'application/pdf', 'application/x-pdf', 'application/acrobat',
    'applications/vnd.pdf', 'text/pdf', 'text/x-pd'
]

def upload_document(files, set_id, document_id, user_id, source='uploaded'):
    document_info = []

    db.find_or_create_and_validate_document_set(set_id, user_id)
    for file in files:
        if (not file.content_type or
                file.content_type in ALLOWED_PDF_MIME_TYPES):
            document_info.append(db.add_document(
                set_id, document_id, file.filename, file.read(), source
            ))
    return document_info


def generate_signed_filename(file_id):
    return SIGNED_FILE_PREFIX + file_id + '.pdf'

def get_service_url(requestUrl):
    url = urlparse(request.url)
    return """%s://%s""" % (url.scheme, url.netloc)


def save_temp_signature(signature_id, user_id):
    signature_binary = db.get_signature(signature_id, user_id)

    signature_filename = SIGNATURE_FILE_PREFIX + str(uuid.uuid4()) + '.png'
    signature_filepath = os.path.join(TMP_DIR, signature_filename)

    signature_writer = open(signature_filepath, "wb")
    signature_writer.write(signature_binary)
    signature_writer.close()

    return signature_filepath


def upload_signature(base64Image, signature_type):
    signature_id = db.add_signature(
        session['user_id'],
        b64decode(base64Image.split(",")[1]),
        signature_type
    )
    return {'signature_id': signature_id}


def delete_signature(id):
    signature_id = db.remove_signature(
        id,
        session['user_id']
    )
    if not signature_id:
        raise InvalidUsage('Not Found', status_code=404)
    return {}


def thumb(file_id):
    output = tempfile.NamedTemporaryFile(suffix='.png', delete=False)

    try:
        pdf_first_page_path = os.path.join(TMP_DIR, file_id + '.pdf[0]')
        args = thumb_cmds[:] + [pdf_first_page_path, output.name]
        Popen(args, stdout=DEVNULL, stderr=STDOUT).wait()
        return output.read()
    except Exception as e:
        raise e
    finally:
        output.close()


def invite_users(users, link, sender):
    for user in users:
        user['link'] = link
    params = {
        'client_id': current_app.config.get('OAUTH_CLIENT_ID'),
        'client_secret': current_app.config.get('OAUTH_CLIENT_SECRET'),
        'sender_name': sender,
        'users': json.dumps(users)
    }
    response = requests.post(
        current_app.config.get('AUTH_SERVER') + '/api/user/invite-users',
        params=params
    )
    return response.json()


def lookup_user(user_id):
    params = {
        'client_id': current_app.config.get('OAUTH_CLIENT_ID'),
        'client_secret': current_app.config.get('OAUTH_CLIENT_SECRET'),
    }
    response = requests.get(
        '%s/%s/%s' % (current_app.config.get('AUTH_SERVER'), '/api/user', user_id),
        params=params
    )
    results = response.json()
    results['user_id'] = results['id']
    return results


def lookup_user_and_upsert(user_id):
    user = lookup_user(user_id)
    db.upsert_user(user)
    return user


def join_and(names):
    n = len(names)
    if n > 1:
        return ('{}, '*(n-2) + '{} & {}').format(*names)
    elif n > 0:
        return names[0]
    else:
        return ''


def is_set_complete(document_set_id):
    print(db.document_set_status(document_set_id)[0])
    return db.document_set_status(document_set_id)[0] == 'Complete'


def send_email(template, email, name, subject, data):
    try:
        params = {
            'client_id': current_app.config.get('OAUTH_CLIENT_ID'),
            'client_secret': current_app.config.get('OAUTH_CLIENT_SECRET'),
            'template': template,
            'email': email,
            'name': name,
            'subject': subject,
            'data': json.dumps(data)
        }

        response = requests.post(current_app.config.get('AUTH_SERVER') + '/mail/send', data=params)
        return response.json()
    except Exception as e:
        raise InvalidUsage('Failed to send email %s' % template, status_code=500, error=e)



def send_completion_email(document_set_id):
    # a document is complete when every recipient has responded
    # a response can be a sign or a reject
    # a document set is complete when is every document is complete
    # when a document set is 'complete' you will receive a notification if:
    # 1) you are the inviter
    # 2) you signed any document in the set that is fully signed
    try:
        user = db.get_document_set_owner(document_set_id)
        responders = db.get_document_set_signers(document_set_id)
        document_set = db.get_document_set(user['user_id'], document_set_id)

        statuses = []
        for document in document_set['documents']:
            for request_info in document.get('request_info', []):
                statuses.append(request_info['status'])

        # if all rejected:
        if all([status == 'Rejected' for status in statuses]):
            msg = 'Signing Session Complete, All Documents Rejected'
        # if some
        elif any([status == 'Rejected' for status in statuses]):
            msg = 'Signing Session Complete, Some Documents Rejected'

        else:
            msg = 'Signing Session Complete, All Documents Signed'

        for responder in responders:
            # if they accepted any
            if responder['any_accepted']:
                data = {
                    'title': msg,
                    'name': responder['name'],
                    'setDescription': 'The documents that you signed for %s are now complete' % user['name'],
                    'link': '%s/documents/%s' % (get_service_url(request.url), document_set_id)
                }
                send_email('emails.sign.signing-complete', responder['email'], responder['name'], msg, data)

        if len(responders) == 1:
            set_description = """%s has responded to your sign request.""" % responders[0]['name']
        else:
            set_description = """%s have all responded to your sign requests.""" % join_and([r['name'] for r in responders])

        data = {
            'title': msg,
            'name': user['name'],
            'setDescription': set_description,
            'link': '%s/documents/%s' % (get_service_url(request.url), document_set_id)
        }
        #check_send_to_external_service()
        return send_email('emails.sign.signing-complete', user['email'], user['name'], msg, data)

    except Exception as e:
        raise InvalidUsage('Failed to send completion email', status_code=500, error=e)


def send_completion_target(document_set_id):
    meta = db.get_document_set_meta(document_set_id)
    try:
        if meta and meta.get('callbackUrl'):
            user = db.get_document_set_owner(document_set_id)
            documents = db.get_document_set(user['user_id'], document_set_id)
            files = []
            for doc in documents['documents']:
                document = db.get_document(session['user_id'], doc['document_id'])
                files.append(
                    ('file', (document['filename'], BytesIO(document['data']), 'application/pdf'))
                )
            response = requests.post(meta.get('callbackUrl'), files=files)
            return {'export_target': {
                'url': response.json().get('url'),
                'name': 'Good Companies'
                }
            }
        return {}
    except Exception as e:
        print(e)
        return {}


def should_send_reject_email(user_id, document_set_id):
    # if this users requests are complete and any documents are rejected, return true
    for doc_set in db.get_signature_requests(session['user_id']):
        if doc_set['document_set_id'] == document_set_id:
            return (all([doc['request_status'] != 'Pending' for doc in doc_set['documents']]) and
                    any([doc['request_status'] == 'Rejected' for doc in doc_set['documents']]))
    return False


def send_rejection_email(user_id, document_set_id, rejectedMessage=None):
    try:
        inviter = db.get_document_set_owner(document_set_id)
        rejector = db.get_user_info(user_id)

        data = {
            'recipientName': inviter['name'],
            'rejectorName': rejector['name'],
            'link': '%s/documents/%s' % (get_service_url(request.url), document_set_id),
            'rejectedMessage': rejectedMessage
        }

        return send_email('emails.sign.document-rejected', inviter['email'], inviter['name'], 'Document Rejected in CataLex Sign', data)
    except Exception as e:
        raise InvalidUsage('Failed to send rejection email', status_code=500, error=e)


def can_sign_or_submit(user_id):
    return not db.get_usage(user_id,
                            current_app.config.get('MAX_SIGNS'),
                            current_app.config.get('MAX_SIGN_UNIT'))['max_allowance_reached']


def has_sign_request(user_id, sign_request_id):
    return db.get_sign_request(user_id, sign_request_id) is not None


def document_is_latest(document_id):
    return document_id == db.get_latest_version(document_id)


def get_user_info():
    if session.get('user_id'):
        return db.get_user_info(session['user_id'])


def has_verified_email(user_id):
    return db.get_user_info(user_id)['email_verified']

def get_user_usage():
    if session.get('user_id'):
        return db.get_usage(session['user_id'],
                            current_app.config.get('MAX_SIGNS'),
                            current_app.config.get('MAX_SIGN_UNIT'))

def get_user_meta():
    if 'user_id' in session:
        return db.get_user_meta(session['user_id'])


def owns_document(user_id, document_id):
    return db.user_owns_document(user_id, document_id)

@api.route('/documents', methods=['GET'])
@protected
@nocache
def get_document_set_list():
    return jsonify(db.get_user_document_sets(session['user_id']))


@api.route('/documents', methods=['POST'])
@protected
@nocache
def document_upload():
    try:
        if not can_sign_or_submit(session['user_id']):
            abort(401, {'type': 'USAGE_LIMIT_REACHED'})
        file = request.files.getlist('file[]')
        set_id = request.form.get('document_set_id')
        document_id = request.form.get('document_id')
        user_id = session['user_id']
        return jsonify(upload_document(file, set_id, document_id, user_id))
    except HTTPException as e:
        raise e
    except Exception as e:
        raise InvalidUsage(e.args, status_code=500, error=e)


@api.route('/save_view/<document_id>', methods=['POST'])
@protected
@nocache
def save_document_view(document_id):
    try:
        db.save_document_view(document_id, session['user_id'], request.get_json())
        return jsonify({'message': 'Saved'})
    except Exception as e:
        print(e)
        raise InvalidUsage(e.message, status_code=500, error=e)


@api.route('/document/<document_id>', methods=['DELETE'])
@protected
@nocache
def remove_document_from_set(document_id):
    try:
        user_id = session['user_id']
        db.remove_document_from_set(user_id, document_id)
        return jsonify({'message': 'Document removed'})
    except Exception as e:
        print(e)
        raise InvalidUsage('Failed to removed document', status_code=500, error=e)


@api.route('/documents/<set_id>', methods=['DELETE'])
@protected
@nocache
def remove_document_set(set_id):
    try:
        user_id = session['user_id']
        documents = db.get_document_set(session['user_id'], set_id)

        for document in documents['documents']:
            for document_id in document['versions']:
                db.remove_document_from_set(user_id, document_id)
        return jsonify({'message': 'Document set removed'})
    except Exception as e:
        print(e)
        raise InvalidUsage('Failed to removed document set', status_code=500, error=e)


@api.route('/documents/<set_id>', methods=['GET'])
@protected
@nocache
def get_documents(set_id):
    try:
        documents = db.get_document_set(session['user_id'], set_id)
        return jsonify(documents)
    except Exception as e:
        raise InvalidUsage(e, status_code=500)


@api.route('/document_order/<set_id>', methods=['POST'])
@protected
@nocache
def document_order(set_id):
    try:
        documents = db.order_documents(session['user_id'], set_id, request.get_json()['documentIds'])
        return jsonify(documents)
    except Exception as e:
        raise InvalidUsage(e, status_code=500)


@api.route('/document/<doc_id>', methods=['GET'])
@protected
@fullcache
def get_document(doc_id):
    try:
        document = db.get_document(session['user_id'], doc_id)
        if not document:
            abort(404)

        response = send_file(BytesIO(document['data']), mimetype='application/pdf', attachment_filename=document['filename'], as_attachment=True);
        response.headers['content-length'] = len(document['data'])
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)
        raise InvalidUsage(e.message, status_code=500, error=e)


@api.route('/download_set/<set_id>', methods=['GET'])
@protected
@nocache
def get_document_set_zip(set_id):
    try:
        documents = db.get_document_set(session['user_id'], set_id)
        output = BytesIO()
        with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as z:
            for doc in documents['documents']:
                document = db.get_document(session['user_id'], doc['document_id'])
                z.writestr(document['filename'], document['data'])
        output.seek(0)
        date_string = request.args.get('datestring', parse(documents['created_at']).strftime("%a, %-I:%-M:%-S %p"))
        return send_file(output, mimetype='application/zip', attachment_filename=('CataLex Sign - %s.zip' % date_string), as_attachment=True)
    except Exception as e:
        raise InvalidUsage(e, status_code=500, error=e)


@api.route('/concat_set/<set_id>', methods=['GET'])
@protected
@nocache
def concat_set(set_id):
    try:
        documents = db.get_document_set(session['user_id'], set_id)
        output = concat([BytesIO(db.get_document(session['user_id'], doc['document_id'])['data']) for doc in documents['documents']])
        db.add_merged_file(output.read(), [doc['document_id'] for doc in documents['documents']])
        output.seek(0)
        date_string = request.args.get('datestring', parse(documents['created_at']).strftime("%a, %-I:%-M:%-S %p"))
        return send_file(output, mimetype='application/pdf', attachment_filename=('CataLex Sign - %s.pdf' % date_string), as_attachment=True)
    except Exception as e:
        print(e)
        raise InvalidUsage(e, status_code=500, error=e)
'''
Signatures
'''


@api.route('/signatures/upload', methods=['POST'])
@protected
@nocache
def signature_upload():
    try:
        base64Image = request.get_json()['base64Image']
        signature_type = request.get_json()['type']
        return jsonify(upload_signature(base64Image, signature_type))
    except Exception as e:
        raise InvalidUsage(e.message, status_code=500, error=e)

@api.route('/signatures/<id>', methods=['DELETE'])
@protected
@nocache
def signature_delete(id):
    try:
        return jsonify(delete_signature(id))
    except Exception as e:
        raise InvalidUsage('Failed', status_code=404, error=e)


@api.route('/signatures', methods=['GET'])
@protected
@nocache
def signatures_list():
    try:
        signatures = db.get_signatures_for_user(session['user_id'])
        return jsonify(signatures)
    except Exception as e:
        raise InvalidUsage('Failed', status_code=500, error=e)


@api.route('/signatures/<id>', methods=['GET'])
@protected
def signature(id):
    try:
        signature = db.get_signature(id, session['user_id'])

        if not signature:
            abort(404)
        signature_file = BytesIO(signature)
        return send_file(signature_file, attachment_filename='signature.png')
    except HTTPException as e:
        raise e

    except Exception as e:
        raise InvalidUsage('Failed', status_code=404, error=e)


'''
Sign
'''
@api.route('/sign', methods=['POST'])
@protected
@nocache
def sign_document():
    args = request.get_json()
    saveable = deepcopy(args)
    if '_csrf_token' in saveable:
        del saveable['_csrf_token']
    document_db = db.get_document(session['user_id'], args['documentId'])
    document_id = args.get('documentId')
    document = BytesIO(document_db['data'])
    filename = document_db['filename']
    sign_request_id = args.get('signRequestId', None)

    if not sign_request_id:
        # if signing a new doc, confirm they are allowed
        if not can_sign_or_submit(session['user_id']):
            abort(401, {'type': 'USAGE_LIMIT_REACHED'})
        if not owns_document(session['user_id'], document_id):
            abort(401, {'type': 'CANNOT_ACCESS_DOCUMENT'})
    else:
        # if signing a request, confirm they are invited and haven't signed yet
        if not has_sign_request(session['user_id'], sign_request_id) or not has_verified_email(session['user_id']):
            abort(401)
    # confirm that this document is the latest in the series
    if not document_is_latest(document_id):
        raise InvalidUsage('Could not sign document', status_code=500, payload={'type': 'OLD_VERSION'})
    try:
        for signature in args.get('signatures', []):
            sig = db.get_signature(signature['signatureId'], session['user_id'])
            if not sig:
                abort(401)
            signature['imgData'] = BytesIO(sig)
        for overlay in args.get('overlays', []):
            base64Image = overlay['dataUrl']
            overlay['imgData'] = BytesIO(b64decode(base64Image.split(",")[1]))
        if not args.get('reject'):
            result = sign(document, args.get('signatures', []), args.get('overlays', []))
            saved_document_id = db.add_document(None, None, filename, result.read())['document_id']
            result.close()
            db.sign_document(session['user_id'], document_id, saved_document_id, sign_request_id, saveable)
        else:
            db.reject_document(session['user_id'], document_id, sign_request_id, {'rejectedMessage': args.get('rejectedMessage')})

        is_complete = is_set_complete(args['documentSetId'])

        if sign_request_id:
            if is_complete:
                send_completion_email(args['documentSetId'])
            elif should_send_reject_email(session['user_id'], args['documentSetId']):
                send_rejection_email(session['user_id'], args['documentSetId'], args.get('rejectedMessage'))

        if is_complete:
            completion_results = send_completion_target(args['documentSetId'])
        else:
            completion_results = {}
        message = {'message': 'done'}
        completion_results.update(message)
        return jsonify(completion_results)
    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)
        raise InvalidUsage('Failed', status_code=401, error=e)


@api.route('/request_signatures', methods=['POST'])
@protected
@nocache
def request_signatures():
    if not can_sign_or_submit(session['user_id']):
        abort(401)
    args = request.get_json()
    link = get_service_url(request.url) + '/to_sign'
    users = invite_users([s['recipient'] for s in args['signatureRequests']], link, sender=db.get_user_info(session['user_id'])['name'])
    [db.upsert_user({'name': user['name'], 'email': user['email'], 'user_id': user['id']}) for user in users]
    users = {user['requestedEmail']: user for user in users}
    for req in args['signatureRequests']:
        req['recipient']['user_id'] = users[req['recipient']['email']]['id']
    db.add_signature_requests(args['documentSetId'], args['signatureRequests'])
    return jsonify({'message': 'Requests sent'})


@api.route('/request_signatures/<sign_request_id>', methods=['DELETE'])
@protected
@nocache
def revoke_request_signatures(sign_request_id):
    # get complete status
    document_set_id = db.document_set_from_request_id(session['user_id'], sign_request_id)
    if not document_set_id:
        abort(401)
    complete = is_set_complete(document_set_id)
    db.revoke_signature_requests(session['user_id'], sign_request_id)
    # get complete status again, if now complete then notify
    if not complete and is_set_complete(document_set_id):
        send_completion_email(document_set_id)
    return jsonify({'message': 'Requests revoked'})


@api.route('/requested_signatures', methods=['GET'])
@protected
@nocache
def get_signature_requests():
    return jsonify(db.get_signature_requests(session['user_id']))


@api.route('/contacts', methods=['GET'])
@protected
@nocache
def get_contacts():
    return jsonify(db.get_contacts(session['user_id']))

@api.route('/usage', methods=['GET'])
@protected
@nocache
def get_usage():
    return jsonify(get_user_usage())


@api.route('/user/meta', methods=['GET'])
@protected
@nocache
def user_meta():
    return jsonify(get_user_meta())


@api.route('/user/meta', methods=['POST'])
@protected
@nocache
def update_user_meta():
    user_id = session['user_id']
    meta = request.get_json()
    db.update_user_meta(user_id, meta.get('meta'))
    return jsonify({'message': 'User meta updated'})


@api.route('/verify/<doc_hash>', methods=['GET'])
def verify_hash(doc_hash):
    return jsonify(db.signed_by(session.get('user_id', None), doc_hash))


@api.route('/send_documents', methods=['POST'])
@protected
@nocache
def email_documents():
    try:
        args = request.get_json()

        user_info = db.get_user_info(session['user_id'])

        params = {
            'client_id': current_app.config.get('OAUTH_CLIENT_ID'),
            'client_secret': current_app.config.get('OAUTH_CLIENT_SECRET'),
            'template': 'emails.sign.email-documents',
            'recipients': json.dumps(args['recipients']),
            'subject': 'Documents from CataLex Sign',
            'sender_name': user_info['name'],
            'sender_email': user_info['email']
        }
        files = []
        for document_id in args['documentIds']:
            document = db.get_document(session['user_id'], document_id)
            files.append(('file', (document['filename'], BytesIO(document['data']), 'application/pdf')))

        response = requests.post(
            current_app.config.get('AUTH_SERVER') + '/mail/send-documents',
            data=params,
            files=files
        )

        return jsonify(response.json())
    except Exception as e:
        raise InvalidUsage('Send document failed', status_code=500, error=e)


@api.route('/catalex/document', methods=['POST'], endpoint="external")
@catalex_protected
@nocache
def catalex_upload_document():
    file = request.files.getlist('file[]')
    if not file:
        abort(400)
    document_id = str(uuid4())
    document_set_id = str(uuid4())
    user_id = request.form.get('user_id')
    if not user_id:
        abort(400)
    user_data = lookup_user_and_upsert(user_id)
    upload_document(file, document_set_id, document_id, user_id, source='gc')
    # todo, get info about who and what company,
    db.add_document_set_meta(document_set_id, json.loads(request.form.get('meta', '{}')))
    return jsonify({'document_id': document_id, 'document_set_id': document_set_id}), 201


@api.route('/invite_tokens', methods=['POST'])
@protected
@nocache
def invite_tokens():
    try:
        args = request.get_json()
        params = {
            'client_id': current_app.config.get('OAUTH_CLIENT_ID'),
            'client_secret': current_app.config.get('OAUTH_CLIENT_SECRET'),
            'email': args['email'],
            'next': '%s/documents/%s' % (get_service_url(request.url), args['document_set_id'])
        }

        response = requests.post(
            current_app.config.get('AUTH_SERVER') + '/api/user/link-to-login',
            data=params
        )

        return jsonify(response.json())
    except Exception as e:
        print(e)
        raise InvalidUsage('Could not get login url', status_code=500, error=e)

