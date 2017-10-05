import getpass


DB_NAME = 'catalex_sign_test'
DB_USER = getpass.getuser()
DB_PASS = ''
DB_HOST = '127.0.0.1'

MAX_SIGNS = 3
MAX_SIGN_UNIT = 'month'

MAX_PAIR_WISE_SIGNS = 15
MAX_PAIR_WISE_UNIT = 'year'

SECRET_KEY = 'hi'


UPLOAD_DOCUMENT_SECRET = 'testsecret'