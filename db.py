import psycopg2
import psycopg2.extras
from flask import g, current_app

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


def get_signatures_for_user(user_id):
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute("SELECT id FROM signatures WHERE user_id = %(user_id)s", {'user_id': user_id})
        signatures = cursor.fetchall()
        return_data = []

        for signature in signatures:
            return_item = { 'id': signature[0] }
            return_data.append(return_item)

        return return_data

def get_signature(signature_id):
    db = get_db();
    with db.cursor() as cursor:
        cursor.execute("SELECT signature FROM signatures WHERE id = %(signature_id)s", {'signature_id': signature_id})
        first_row = cursor.fetchone()
        
        if first_row is None:
            return None
        
        return first_row[0]
