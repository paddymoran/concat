from __future__ import print_function
from functools import wraps, update_wrapper
import errno
import logging
import json
import sys
from flask import (
    Flask, request, redirect, send_file, jsonify, session, abort, url_for,
    send_from_directory, Response, render_template, make_response
)
import db
import requests
import os
import os.path
from io import BytesIO
from subprocess import Popen, STDOUT
import uuid
import tempfile
from sign import sign
import codecs
from copy import deepcopy
from base64 import b64decode
from urllib.parse import urlparse
import zipfile
from dateutil.parser import parse
from datetime import datetime
try:
    from subprocess import DEVNULL  # py3k
except ImportError:
    import os
    DEVNULL = open(os.devnull, 'wb')



logging.basicConfig()

app = Flask(__name__, static_url_path='', static_folder='public', template_folder='public')
config_file_path = os.environ.get('CONFIG_FILE') or sys.argv[1]
app.config.from_pyfile(os.path.join(os.getcwd(), config_file_path))

PORT = app.config.get('PORT')

TMP_DIR = '/tmp/.catalex_sign/'
SIGNATURE_FILE_PREFIX = 'signature_'
SIGNED_FILE_PREFIX = 'signed_'

ALLOWED_PDF_MIME_TYPES = [
    'application/pdf', 'application/x-pdf', 'application/acrobat',
    'applications/vnd.pdf', 'text/pdf', 'text/x-pd'
]

thumb_cmds = [
    'convert', '-thumbnail', '150x', '-background', 'white', '-alpha', 'remove'
]


def upload_document(files, set_id, document_id, user_id):
    document_info = []

    db.find_or_create_and_validate_document_set(set_id, user_id)
    for file in files:
        if (not file.content_type or
                file.content_type in ALLOWED_PDF_MIME_TYPES):
            document_info.append(db.add_document(
                set_id, document_id, file.filename, file.read(),
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


class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


def invite_users(users, link, sender):
    for user in users:
        user['link'] = link
    params = {
        'client_id': app.config.get('OAUTH_CLIENT_ID'),
        'client_secret': app.config.get('OAUTH_CLIENT_SECRET'),
        'sender_name': sender,
        'users': json.dumps(users)
    }
    response = requests.post(
        app.config.get('AUTH_SERVER') + '/api/user/invite-users',
        params=params
    )
    return response.json()

def join_and(names):
    n = len(names)
    if n > 1:
        return ('{}, '*(n-2) + '{} & {}').format(*names)
    elif n > 0:
        return names[0]
    else:
        return ''


def is_set_complete(document_set_id):
    return db.document_set_status(document_set_id)[0] == 'Complete'


def send_email(template, email, name, subject, data):
    try:
        params = {
            'client_id': app.config.get('OAUTH_CLIENT_ID'),
            'client_secret': app.config.get('OAUTH_CLIENT_SECRET'),
            'template': template,
            'email': email,
            'name': name,
            'subject': subject,
            'data': json.dumps(data)
        }

        response = requests.post(app.config.get('AUTH_SERVER') + '/mail/send', data=params)
        return response.json()
    except Exception as e:
        print(e)
        raise InvalidUsage('Failed to send email %s' % template, status_code=500)



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
        for responder in responders:
            # if they accepted any
            if responder['any_accepted']:
                data = {
                    'name': responder['name'],
                    'setDescription': 'The documents that you signed for %s are now complete' % user['name'],
                    'link': '%s/documents/%s' % (get_service_url(request.url), document_set_id)
                }
                send_email('emails.sign.signing-complete', responder['email'], responder['name'], 'Documents Signed & Ready in CataLex Sign', data)

        if len(responders) == 1:
            set_description = """%s has responded to your sign request.""" % responders[0]['name']
        else:
            set_description = """%s have all responded to your sign requests.""" % join_and([r['name'] for r in responders])

        data = {
            'name': user['name'],
            'setDescription': set_description,
            'link': '%s/documents/%s' % (get_service_url(request.url), document_set_id)
        }
        return send_email('emails.sign.signing-complete', user['email'], user['name'], 'Documents Signed & Ready in CataLex Sign', data)

    except Exception as e:
        print(e)
        raise InvalidUsage('Failed to send completion email', status_code=500)


def should_send_reject_email(user_id, document_set_id):
    # if this users requests are complete and any documents are rejected, return true
    for doc_set in db.get_signature_requests(session['user_id']):
        if doc_set['document_set_id'] == document_set_id:
            return (all([doc['request_status'] != 'Penidng' for doc in doc_set['documents']]) and
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

        return send_email('emails.sign.signing-complete', inviter['email'], inviter['name'], 'Document Rejected in CataLex Sign', data)
    except Exception as e:
        print(e)
        raise InvalidUsage('Failed to send rejection email', status_code=500)


def can_sign_or_submit(user_id):
    return not db.get_usage(user_id,
                            app.config.get('MAX_SIGNS'),
                            app.config.get('MAX_SIGN_UNIT'))['max_allowance_reached']


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
                            app.config.get('MAX_SIGNS'),
                            app.config.get('MAX_SIGN_UNIT'))

def get_user_meta():
    if 'user_id' in session:
        return db.get_user_meta(session['user_id'])


def owns_document(user_id, document_id):
    return db.user_owns_document(user_id, document_id)

def login_redirect(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def protected(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return Response(json.dumps({'message': 'Unauthorized'}), 401)
        return f(*args, **kwargs)
    return decorated_function

def nocache(view):
    @wraps(view)
    def no_cache(*args, **kwargs):
        response = make_response(view(*args, **kwargs))
        response.headers['Last-Modified'] = datetime.now()
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
        return response

    return update_wrapper(no_cache, view)

@app.route('/api/documents', methods=['GET'])
@protected
@nocache
def get_document_set_list():
    return jsonify(db.get_user_document_sets(session['user_id']))


@app.route('/api/documents', methods=['POST'])
@protected
@nocache
def document_upload():
    try:
        if not can_sign_or_submit(session['user_id']):
            abort(401)
        file = request.files.getlist('file[]')
        set_id = request.form.get('document_set_id')
        document_id = request.form.get('document_id')
        user_id = session['user_id']
        return jsonify(upload_document(file, set_id, document_id, user_id))
    except Exception as e:
        raise InvalidUsage(e.args, status_code=500)


@app.route('/api/save_view/<document_id>', methods=['POST'])
@protected
@nocache
def save_document_view(document_id):
    try:
        db.save_document_view(document_id, session['user_id'], request.get_json())
        return jsonify({'message': 'Saved'})
    except Exception as e:
        print(e)
        raise InvalidUsage(e.message, status_code=500)


@app.route('/api/document/<document_id>', methods=['DELETE'])
@protected
@nocache
def remove_document_from_set(document_id):
    try:
        user_id = session['user_id']
        db.remove_document_from_set(user_id, document_id)
        return jsonify({'message': 'Document removed'})
    except Exception as e:
        print(e)
        raise InvalidUsage('Failed to removed document', status_code=500)


@app.route('/api/documents/<set_id>', methods=['DELETE'])
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
        raise InvalidUsage('Failed to removed document set', status_code=500)


@app.route('/api/documents/<set_id>', methods=['GET'])
@protected
@nocache
def get_documents(set_id):
    try:
        documents = db.get_document_set(session['user_id'], set_id)
        return jsonify(documents)
    except Exception as e:

        raise InvalidUsage(e, status_code=500)


@app.route('/api/document/<doc_id>', methods=['GET'])
@protected
@nocache
def get_document(doc_id):
    try:
        document = db.get_document(session['user_id'], doc_id)

        if not document:
            abort(404)

        response = send_file(BytesIO(document['data']), mimetype='application/pdf', attachment_filename=document['filename'], as_attachment=True);
        response.headers['content-length'] = len(document['data'])
        return response
    except Exception as e:
        print(e)
        raise InvalidUsage(e.message, status_code=500)


@app.route('/api/download_set/<set_id>', methods=['GET'])
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
        return send_file(output, mimetype='application/pdf', attachment_filename=('CataLex Sign - %s.zip' % date_string), as_attachment=True)
    except Exception as e:
        raise InvalidUsage(e, status_code=500)
'''
Signatures
'''


@app.route('/api/signatures/upload', methods=['POST'])
@protected
@nocache
def signature_upload():
    try:
        base64Image = request.get_json()['base64Image']
        signature_type = request.get_json()['type']
        return jsonify(upload_signature(base64Image, signature_type))
    except Exception as e:
        raise InvalidUsage(e.message, status_code=500)

@app.route('/api/signatures/<id>', methods=['DELETE'])
@protected
@nocache
def signature_delete(id):
    try:
        return jsonify(delete_signature(id))
    except Exception as e:
        raise InvalidUsage('Failed', status_code=404)


@app.route('/api/signatures', methods=['GET'])
@protected
@nocache
def signatures_list():
    try:
        signatures = db.get_signatures_for_user(session['user_id'])
        return jsonify(signatures)
    except Exception as e:
        raise InvalidUsage('Failed', status_code=500)


@app.route('/api/signatures/<id>', methods=['GET'])
@protected
@nocache
def signature(id):
    try:
        signature = db.get_signature(id, session['user_id'])

        if not signature:
            abort(404)

        signature_file = BytesIO(signature)
        return send_file(signature_file, attachment_filename='signature.png')
    except Exception as e:
        raise InvalidUsage('Failed', status_code=404)


'''
Sign
'''
@app.route('/api/sign', methods=['POST'])
@protected
@nocache
def sign_document():
    args = request.get_json()
    saveable = deepcopy(args)
    document_db = db.get_document(session['user_id'], args['documentId'])
    document_id = args['documentId']
    document = BytesIO(document_db['data'])
    filename = document_db['filename']
    sign_request_id = args.get('signRequestId', None)
    if not sign_request_id:
        # if signing a new doc, confirm they are allowed
        if not can_sign_or_submit(session['user_id']) or not owns_document(session['user_id'], document_id):
            abort(401)
    else:
        # if signing a request, confirm they are invited and haven't signed yet
        if not has_sign_request(session['user_id'], sign_request_id) or not has_verified_email(session['user_id']):
            abort(401)

    # confirm that this document is the latest in the series
    if not document_is_latest(document_id):
        raise InvalidUsage('Could not sign document', status_code=500, payload={'type': 'OLD_VERSION'})

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
    if sign_request_id:
        is_complete = is_set_complete(args['documentSetId'])
        if is_complete:
            send_completion_email(args['documentSetId'])
        elif should_send_reject_email(session['user_id'], args['documentSetId']):
            send_rejection_email(session['user_id'], args['documentSetId'], args.get('rejectedMessage'))

    return jsonify({'message': 'done'})


@app.route('/api/request_signatures', methods=['POST'])
@protected
@nocache
def request_signatures():
    if not can_sign_or_submit(session['user_id']):
        abort(401)
    args = request.get_json()
    link = get_service_url(request.url) + '/to_sign'
    users = invite_users([s['recipient'] for s in args['signatureRequests']], link, sender=db.get_user_info(session['user_id'])['name'])
    [db.upsert_user({'name': user['name'], 'email': user['email'], 'user_id': user['id']}) for user in users]
    users = {user['email']: user for user in users}
    for req in args['signatureRequests']:
        req['recipient']['user_id'] = users[req['recipient']['email']]['id']
    db.add_signature_requests(args['documentSetId'], args['signatureRequests'])
    return jsonify({'message': 'Requests sent'})


@app.route('/api/request_signatures/<sign_request_id>', methods=['DELETE'])
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


@app.route('/api/requested_signatures', methods=['GET'])
@protected
@nocache
def get_signature_requests():
    return jsonify(db.get_signature_requests(session['user_id']))


@app.route('/api/contacts', methods=['GET'])
@protected
@nocache
def get_contacts():
    return jsonify(db.get_contacts(session['user_id']))

@app.route('/api/usage', methods=['GET'])
@protected
@nocache
def get_usage():
    return jsonify(get_user_usage())


@app.route('/api/user/meta', methods=['GET'])
@protected
@nocache
def user_meta():
    return jsonify(get_user_meta())


@app.route('/api/user/meta', methods=['POST'])
@protected
@nocache
def update_user_meta():
    user_id = session['user_id']
    meta = request.get_json()
    db.update_user_meta(user_id, json.dumps(meta.get('meta')))
    return jsonify({'message': 'User meta updated'})


@app.route('/api/verify/<doc_hash>', methods=['GET'])
def verify_hash(doc_hash):
    return jsonify(db.signed_by(session.get('user_id', None), doc_hash))


@app.route('/api/send_documents', methods=['POST'])
@protected
@nocache
def email_documents():
    try:
        args = request.get_json()

        user_info = db.get_user_info(session['user_id'])

        params = {
            'client_id': app.config.get('OAUTH_CLIENT_ID'),
            'client_secret': app.config.get('OAUTH_CLIENT_SECRET'),
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
            app.config.get('AUTH_SERVER') + '/mail/send-documents',
            data=params,
            files=files
        )

        return jsonify(response.json())
    except Exception as e:
        print(e)
        raise InvalidUsage('Send document failed', status_code=500)


@app.route('/login', methods=['GET'])
def login():
    try:
        args = request.args.to_dict()
        user_data = {}

        if app.config.get('DEV_USER_ID'):
            user_data = {
                'user_id': app.config.get('DEV_USER_ID'),
                'name': 'Dev User',
                'email': 'dev@user.com'
            }
        else:
            code = args.get('code')

            # If the is no code, redirect to the users site to get a code
            if not all([code]):
                next = args.get('next')
                oauthUrl = app.config.get('OAUTH_URL')

                # include the next url if there is one
                if next is not None:
                    oauthUrl += '?next=' + args.get('next')

                return redirect(oauthUrl)

            # We have a code, so use it to get and access token
            params = {
                'code': code,
                'grant_type': 'authorization_code',
                'client_id': app.config.get('OAUTH_CLIENT_ID'),
                'client_secret': app.config.get('OAUTH_CLIENT_SECRET'),
                'redirect_uri': app.config.get('LOGIN_URL'),
                'next': args.get('next')
            }

            response = requests.post(
                app.config.get('AUTH_SERVER') + '/oauth/access_token',
                data=params
            )

            access_data = response.json()

            response = requests.get(
                app.config.get('AUTH_SERVER') + '/api/user',
                params={'access_token': access_data['access_token']}
            )

            user_data = response.json()
            user_data['user_id'] = user_data['id']
            user_data['name'] = user_data['name']
            user_data['subscribed'] = ('CataLex Sign' in user_data['services']) or app.config.get('ALL_SUBSCRIBED', False)

        db.upsert_user(user_data)
        session['user_id'] = user_data['user_id']

        redirect_uri = request.args.get('next', url_for('catch_all'))
        return redirect(redirect_uri)
    except Exception as e:
        print(e)
        raise InvalidUsage('Could not log in', status_code=500)

@app.route('/verify', methods=['GET'], endpoint="verify")
def verify():
    return render_root()


@app.route('/signup', methods=['GET'])
def signup():
    session.clear()
    return redirect(app.config.get('AUTH_SERVER') + '/my-services?Sign=1')


@app.route('/verify_email', methods=['GET'])
def verify_email():
    session.clear()
    return redirect(app.config.get('AUTH_SERVER'))


@app.route('/logout', methods=['GET'])
def logout():
    session.clear()
    return redirect(app.config.get('USER_LOGOUT_URL'))

@nocache
def render_root():
    # TODO go async or combine these queries
    return render_template('index.html', store={'user': get_user_info(), 'usage': get_user_usage(), 'userMeta': get_user_meta()})


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
@login_redirect
def catch_all(path):
    return render_root()


@app.errorhandler(401)
def custom_401(error):
    return Response(json.dumps({'message': 'Unauthorized'}), 401)


@app.errorhandler(404)
def send_index(path):
    return render_root()


@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response




try:
    os.makedirs(TMP_DIR)
except OSError as exception:
    if exception.errno != errno.EEXIST:
        raise
if __name__ == '__main__':
    print('Running on %d' % PORT)
    app.run(port=PORT, debug=True, host='0.0.0.0', threaded=True)
