from __future__ import print_function
import errno
import logging
import json
import sys
from flask import Flask, request, redirect, send_file, jsonify, send_from_directory, session, abort
import db
import requests
import os
import os.path
from io import BytesIO
import tempfile
from subprocess import Popen, STDOUT
import uuid
from base64 import decodestring
try:
    from subprocess import DEVNULL  # py3k
except ImportError:
    import os
    DEVNULL = open(os.devnull, 'wb')

logging.basicConfig()

app = Flask(__name__, static_url_path='', static_folder='public')
app.config.from_pyfile('./config_dev.py')

PORT = app.config.get('PORT')

concat_cmds = ['gs', '-dBATCH', '-dNOPAUSE', '-q', '-sDEVICE=pdfwrite']
thumb_cmds = ['convert', '-thumbnail', '150x', '-background', 'white', '-alpha', 'remove']



TMP_DIR = '/tmp/.concat/'


def concat_file_ids(file_ids, options):
    try:
        print(file_ids)
        output = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
        args = concat_cmds[:] + ['-sOutputFile=%s' % output.name]

        if options.get('deskew') == 'true':
            args += ['-deskew', '40']


        for f in file_ids:
            args.append(os.path.join(TMP_DIR, f)+'.pdf')

        print(' '.join(args))
        Popen(args,
              stdout=DEVNULL,
              stderr=STDOUT).wait()
        return output.read()
    except Exception as e:
        raise e
    finally:
        output.close()



def thumb(file_id):
    try:
        output = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
        args = thumb_cmds[:] + [os.path.join(TMP_DIR, file_id + '.pdf[0]'), output.name]
        Popen(args,
              stdout=DEVNULL,
              stderr=STDOUT).wait()
        return output.read()
    except Exception, e:
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


def upload_document(files):
    results = {}
    for f in files:
        file_id = str(uuid.uuid4())
        results[f.filename] = file_id
        f.save(os.path.join(TMP_DIR, file_id + '.pdf'))
    return results

def upload_signature(base64Image):
    add_signature(1, str(base64Image.split(",")[1].decode('base64')))
    return { 'success': True }

@app.route('/documents/upload', methods=['POST'])
def document_upload():
    try:
        return jsonify(upload_document(request.files.getlist("file[]")))
    except Exception as e:
        print(e)
        raise InvalidUsage(e.message, status_code=500)

@app.route('/signatures/upload', methods=['POST'])
def signature_upload():
    try:
        base64Image = json.loads(request.data)['base64Image']
        return jsonify(upload_signature(base64Image))
    except Exception as e:
        print(e)
        raise InvalidUsage(e.message, status_code=500)


@app.route('/signatures', methods=['GET'])
def signatures():
    try:
        signatures = db.get_signatures_for_user(1)
        return jsonify(signatures)
    except Exception as e:
        print(e)
        raise InvalidUsage(e.message, status_code=500)

@app.route('/signatures/<id>', methods=['GET'])
def signature(id):
    try:
        signature = db.get_signature(id)

        if not signature:
            abort(404)

        signature_file = BytesIO(signature)
        return send_file(signature_file, attachment_filename='signature.png');
    except Exception as e:
        print(e)
        raise InvalidUsage(e.message, status_code=500)


@app.route('/concat', methods=['GET'])
def concat():
    try:
        result = concat_file_ids(request.args.getlist("file_ids[]"), options=request.args)
        return send_file(BytesIO(result),
                         attachment_filename=request.args.get('filename', 'concat-merge.pdf'),
                         as_attachment=True,
                         mimetype='application/pdf')
    except Exception as e:
        print(e)
        raise InvalidUsage(e.message, status_code=500)


@app.route('/login', methods=['GET'])
def login():
    args = request.args
    provided_code = args.get('code')

    if not all([provided_code]):
        return redirect('http://catalexusers.dev/sign-login')

    params = {
        'code': provided_code,
        'grant_type': 'authorization_code',
        'client_id': 'sign',
        'client_secret': 'test',
        'redirect_uri': 'http://localhost:5669/login'
    }

    response = requests.post('http://catalexusers.dev/oauth/access_token', data=params)
    access_data = response.json()

    response = requests.get('http://catalexusers.dev/api/user', params={'access_token': access_data['access_token']})
    user_data = response.json()

    session['user_id'] = user_data['id']
    session['user_name'] = user_data['email']

    return jsonify({'success': True})


@app.route('/', methods=['GET'])
def index():
    return app.send_static_file('index.html')


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
    app.run(port=PORT, debug=True, host='0.0.0.0')
