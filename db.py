import psycopg2
import psycopg2.extras
from flask import g, current_app
import StringIO
import pickle
from io import BytesIO
import base64

def get_db():
    if not hasattr(g, 'db') or g.db.closed:
        g.db = connect_db()
    return g.db


def connect_db():
    connection = psycopg2.connect(
        database=current_app.config['DB_NAME'],
        user=current_app.config['DB_USER'],
        password=current_app.config['DB_PASS'],
        host=current_app.config['DB_HOST'])
    return connection

def add_signature(user_id, binary_file_data):
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute("INSERT INTO signatures (user_id, signature) VALUES (%(user_id)s, %(blob)s)", {
            'user_id': user_id,
            'blob': psycopg2.Binary(binary_file_data)
        })
        db.commit()

def get_signature(signature_id):
    db = get_db();
    with db.cursor() as cursor:
        cursor.execute("SELECT signature FROM signatures WHERE id = %(signature_id)s", {
            'signature_id': signature_id,
        })
        result = cursor.fetchone()
        base64_img = base64.b64encode(result[0])

        # print(base64_img)

        # result[0]
        # print(StringIO.StringIO(result[0]))
        # print(pickle.load(result))
        # bio = BytesIO(b"some initial binary data: \x00\x01")
        # print(str(bio))
        return result[0]
        return base64_img
