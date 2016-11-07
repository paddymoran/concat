from __future__ import print_function
import errno
import logging
import json
import sys
from flask import Flask, request, redirect, send_file, jsonify, send_from_directory, session, abort, url_for
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

TMP_DIR = '/tmp/.catalex_sign/'
SIGNATURE_FILE_PREFIX = 'signature_'
SIGNED_FILE_PREFIX = 'signed_'


def upload_document(file):
    path = os.path.join(TMP_DIR, str(uuid.uuid4()) + '.pdf')
    file.save(path)

    return path


def generate_signed_filename(file_id):
    return SIGNED_FILE_PREFIX + file_id + '.pdf'


def sign_document(file, signature_id, user_id, page_number, x_offset, y_offset, x_scale, y_scale):
    pdf_filepath = upload_document(file)
    signed_file_id = str(uuid.uuid4())
    signed_filename = generate_signed_filename(signed_file_id)

    signature_filepath = save_temp_signature(signature_id, user_id)
    
    Popen(['sh', './sign.sh', pdf_filepath, str(page_number), signature_filepath, str(x_offset), str(y_offset), str(x_scale), str(y_scale), os.path.join(TMP_DIR, signed_filename)],
        stdout=DEVNULL,
        stderr=STDOUT).wait()

    return signed_file_id

def save_temp_signature(signature_id, user_id):
    signature_binary = db.get_signature(signature_id, user_id)
    
    signature_filename = SIGNATURE_FILE_PREFIX + str(uuid.uuid4()) + '.png'
    signature_filepath = os.path.join(TMP_DIR, signature_filename)

    signature_writer = open(signature_filepath, "wb")
    signature_writer.write(signature_binary)
    signature_writer.close()

    return signature_filepath

def upload_signature(base64Image):
    db.add_signature(session['user_id'], str(base64Image.split(",")[1].decode('base64')))
    return { 'success': True }


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
        signatures = db.get_signatures_for_user(session['user_id'])
        return jsonify(signatures)
    except Exception as e:
        print(e)
        raise InvalidUsage(e.message, status_code=500)

@app.route('/signatures/<id>', methods=['GET'])
def signature(id):
    try:
        signature = db.get_signature(id, session['user_id'])

        if not signature:
            abort(404)

        signature_file = BytesIO(signature)
        return send_file(signature_file, attachment_filename='signature.png')
    except Exception as e:
        print(e)
        raise InvalidUsage(e.message, status_code=500)


@app.route('/sign', methods=['POST'])
def sign():
    file = request.files['file']
    signature_id = request.form['signature_id']
    user_id = session['user_id']
    page_number = request.form['page_number']
    x_offset = request.form['x_offset']
    y_offset = request.form['y_offset']
    x_scale = request.form['width_ratio']
    y_scale = request.form['height_ratio']

    file_id = sign_document(file, signature_id, user_id, page_number, x_offset, y_offset, x_scale, y_scale)

    return jsonify({ 'file_id': file_id })


@app.route('/signed-documents/<uuid>', methods=['GET'])
def get_signed_pdf(uuid):
    filepath = os.path.join(TMP_DIR, generate_signed_filename(uuid))

    return send_file(filepath,
             attachment_filename=request.args.get('filename', 'signed-document.pdf'),
             as_attachment=True,
             mimetype='application/pdf')


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

    return redirect(url_for('index'))


@app.route('/', methods=['GET'])
def index():
    return app.send_static_file('index.html')


@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


@app.before_request
def before_request():
    if not 'user_id' in session and request.endpoint is not 'login':
        return redirect(url_for('login'))


try:
    os.makedirs(TMP_DIR)
except OSError as exception:
    if exception.errno != errno.EEXIST:
        raise
if __name__ == '__main__':
    print('Running on %d' % PORT)
    app.run(port=PORT, debug=True, host='0.0.0.0')
