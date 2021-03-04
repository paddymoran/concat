import getpass

PORT=5669

SERVER_NAME = 'localhost:5669'
LOGIN_URL = 'http://localhost:5669/login'
AUTH_SERVER = 'http://192.168.0.153:8000'
OAUTH_URL = 'http://192.168.0.153:8000/sign-login'

USER_LOGOUT_URL = 'http://192.168.0.153:8000/auth/logout'

OAUTH_CLIENT_ID = 'sign'
OAUTH_CLIENT_SECRET = 'test'

SECRET_KEY = 'dfglihdklsjblfkdjhvliakhjdlkjashdfkleahs'

DB_NAME = 'sign'
DB_USER = 'sign'
DB_PASS = 'sign'
DB_HOST = '127.0.0.1'

MAX_SIGNS = 3
MAX_SIGN_UNIT = 'month'


MAX_PAIR_WISE_SIGNS = 15
MAX_PAIR_WISE_UNIT = 'year'

UPLOAD_DOCUMENT_SECRET = 'nobodyknows'

DEV_USER_ID = 9