from __future__ import print_function
import errno
import logging
import json
import sys
from flask import Flask, request, redirect, send_file, jsonify, session, abort, url_for
import db
import requests
import os
import os.path
from io import BytesIO
from subprocess import Popen, STDOUT
import uuid
try:
    from subprocess import DEVNULL  # py3k
except ImportError:
    import os
    DEVNULL = open(os.devnull, 'wb')

logging.basicConfig()

app = Flask(__name__, static_url_path='', static_folder='public')
app.config.from_pyfile(os.environ.get('CONFIG_FILE') or sys.argv[1])

PORT = app.config.get('PORT')

@app.route('/', methods=['GET'], defaults={'path': ''})
@app.route('/<path:path>', methods=['GET'])
def catch_all(path):
    return app.send_static_file('index.html')

if __name__ == '__main__':
    print('Running on %d' % PORT)
    app.run(port=PORT, debug=True, host='0.0.0.0', threaded=True)
