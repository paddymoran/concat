import getpass

PORT=5669

SERVER_NAME = 'localhost:5669'
LOGIN_URL = 'http://localhost:5669/login'
AUTH_SERVER = 'http://192.168.0.153:8000'
OAUTH_URL = 'http://192.168.0.153:8000/sign-login'

USER_LOGOUT_URL = 'http://192.168.0.153:8000/auth/logout'

OAUTH_CLIENT_ID = 'sign'
OAUTH_CLIENT_SECRET = 'test'

SECRET_KEY = 'dfglihdklsjblfkdjhvliakhjdlkjashdfkleah'

DB_NAME = 'catalex_sign'
DB_USER = getpass.getuser()
DB_PASS = ''
DB_HOST = '127.0.0.1'

#DEV_USER_ID = 1