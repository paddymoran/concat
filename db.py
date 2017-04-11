import psycopg2
import psycopg2.extras
from flask import g, current_app

def get_db():
    if not hasattr(g, 'db') or g.db.closed:
        g.db = connect_db()
    return g.db

def close_db():
    if hasattr(g, 'db') and not g.db.closed:
        g.db.close()


def connect_db():
    return connect_db_config(current_app.config)

def connect_db_config(config):
    connection = psycopg2.connect(
        database=config['DB_NAME'],
        user=config['DB_USER'],
        password=config['DB_PASS'],
        host=config['DB_HOST'])
    return connection

def add_signature(user_id, binary_file_data):
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute("INSERT INTO signatures (user_id, signature) VALUES (%(user_id)s, %(blob)s) RETURNING id", {
            'user_id': user_id,
            'blob': psycopg2.Binary(binary_file_data)
        })
        db.commit()
        return cursor.fetchone()[0]

def get_signatures_for_user(user_id):
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute("SELECT id FROM signatures WHERE user_id = %(user_id)s AND deleted IS FALSE", {'user_id': user_id})
        signatures = cursor.fetchall()
        return_data = []

        for signature in signatures:
            return_item = { 'id': signature[0] }
            return_data.append(return_item)
        return return_data

def get_signature(signature_id, user_id):
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute("SELECT signature FROM signatures WHERE id = %(signature_id)s AND user_id = %(user_id)s AND deleted IS FALSE", {
            'signature_id': signature_id,
            'user_id': user_id,
        })
        first_row = cursor.fetchone()

        if first_row is None:
            return None

        return first_row[0]


def upsert_user(user):
    db = get_db()
    query = """INSERT INTO users (user_id, name, email)
        VALUES (%(user_id)s, %(name)s, %(email)s)
        ON CONFLICT (user_id) DO UPDATE SET name = %(name)s, email = %(email)s; """
    with db.cursor() as cursor:
        cursor.execute(query, user)
    return


def get_user_info(user_id):
    db = get_db()
    with db.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
        cursor.execute("SELECT user_id, name, email from users where user_id = %(user_id)s", {
            'user_id': user_id,
        })
        return cursor.fetchone()



def get_user_document_sets(user_id):
    pass


def get_document(user_id, document_id):
    pass


def sign_document(user_id, sign_request_id, data):
    pass


def get_set(user_id, set_id):
    pass


def create_set(user_id, data):
    pass
