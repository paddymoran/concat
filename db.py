"""

Functions for working with the database

"""

import psycopg2
import psycopg2.extras
from flask import g, current_app


def get_db():
    """
    Return a connected database instance and save it to flask globals for next time
    """
    if not hasattr(g, 'db') or g.db.closed:
        g.db = connect_db_config(current_app.config)
    return g.db


def close_db():
    """
    If we have saved a conencted database instance to flask globals, close the connection
    """
    if hasattr(g, 'db') and not g.db.closed:
        g.db.close()


def connect_db_config(config):
    """
    Create a psycopg2 connection to the database
    """
    connection = psycopg2.connect(
        database=config['DB_NAME'],
        user=config['DB_USER'],
        password=config['DB_PASS'],
        host=config['DB_HOST'])
    return connection


def add_signature(user_id, binary_file_data):
    """
    Add a signature to the database
    """
    database = get_db()
    with database.cursor() as cursor:
        query = """
            INSERT INTO signatures (user_id, signature)
            VALUES (%(user_id)s, %(blob)s)
            RETURNING signature_id
        """

        cursor.execute(query, {
            'user_id': user_id,
            'blob': psycopg2.Binary(binary_file_data)
        })
        database.commit()
        return cursor.fetchone()[0]


def find_or_create_and_validate_document_set(set_id, user_id):
    """
    Find or create a document set, making sure the user has permission to access it
    """
    database = get_db()
    with database.cursor() as cursor:
        find_doc_set_query = """
            SELECT user_id
            FROM document_sets
            WHERE document_set_id = %(set_id)s
        """
        cursor.execute(find_doc_set_query, {
            'set_id': set_id,
        })
        result = cursor.fetchone()

        if not result:
            create_doc_set_query = """
                INSERT INTO document_sets (document_set_id, user_id)
                VALUES (%(set_id)s, %(user_id)s)
            """

            cursor.execute(create_doc_set_query, {
                'set_id': set_id,
                'user_id': user_id
            })

            database.commit()
        elif result[0] != user_id:
            raise Exception


def add_document(set_id, doc_data_id, filename, binary_file_data):
    """
    Add a document to the database. If no UUID is passed, one will be created
    by the database.
    """
    database = get_db()
    with database.cursor() as cursor:
        # Create the document data record
        create_doc_data_query = """
            INSERT INTO document_data (document_data_id, data)
            VALUES (%(doc_data_id)s, %(blob)s)
            RETURNING document_data_id
        """

        cursor.execute(create_doc_data_query, {
            'doc_data_id': doc_data_id,
            'blob': psycopg2.Binary(binary_file_data)
        })
        data_id = cursor.fetchone()[0]

        # Create the document record, including the ID of the document data
        create_document_query = """
            INSERT INTO documents (document_set_id, filename, document_data_id)
            VALUES (%(set_id)s, %(filename)s, %(document_data_id)s)
            RETURNING document_id
        """

        cursor.execute(create_document_query, {
            'set_id': set_id,
            'filename': filename,
            'document_data_id': data_id
        })
        document_id = cursor.fetchone()[0]

        database.commit()

        # Return the document ID and the filename
        return {
            'document_id': document_id,
            'filename': filename
        }


def get_signatures_for_user(user_id):
    """
    Get all signatures for a user
    """
    database = get_db()
    with database.cursor() as cursor:
        query = """
            SELECT signature_id
            FROM signatures
            WHERE user_id = %(user_id)s
                AND deleted IS FALSE
        """
        cursor.execute(query, {'user_id': user_id})
        signatures = cursor.fetchall()
        return_data = []

        for signature in signatures:
            return_item = {'id': signature[0]}
            return_data.append(return_item)
        return return_data


def get_signature(signature_id, user_id):
    """
    Get a signature, making sure the user has permission to access it
    """
    database = get_db()
    with database.cursor() as cursor:
        query = """
            SELECT signature
            FROM signatures
            WHERE signature_id = %(signature_id)s
                AND user_id = %(user_id)s
                AND deleted IS FALSE
        """
        cursor.execute(query, {
            'signature_id': signature_id,
            'user_id': user_id,
        })
        first_row = cursor.fetchone()

        if first_row is None:
            return None

        return first_row[0]


def upsert_user(user):
    """
    Create or update a user
    """
    database = get_db()
    query = """
        INSERT INTO users (user_id, name, email)
        VALUES (%(user_id)s, %(name)s, %(email)s)
        ON CONFLICT (user_id) DO UPDATE SET name = %(name)s, email = %(email)s;
    """
    with database.cursor() as cursor:
        cursor.execute(query, user)

    database.commit()

    return


def get_user_info(user_id):
    """
    Get a user's basic info
    """
    database = get_db()
    with database.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
        query = """
            SELECT user_id, name, email from users where user_id = %(user_id)s
        """
        cursor.execute(query, {'user_id': user_id})
        return cursor.fetchone()


def get_user_document_sets(user_id):
    """
    Get all document sets for a user
    """
    database = get_db()
    query = """
        SELECT * FROM document_sets sets
        JOIN document_set_mapper set_mapper ON
            sets.document_set_id = set_mapper.document_id
        JOIN documents ON
            set_mapper.document_set_id = documents.document_id
        WHERE sets.user_id = %(user_id)s
    """
    with database.cursor() as cursor:
        cursor.execute(query, user_id)
        data = cursor.fetchall()

        return data


def get_document(user_id, document_id):
    """
    Get a document, checking the user has permission to access it
    """
    database = get_db()
    query = """
        SELECT document_id, d.document_set_id, hash, filename, data
        FROM documents d
        JOIN document_sets ds on ds.document_set_id = d.document_set_id
        JOIN document_data dd on d.document_data_id = dd.document_data_id
        WHERE user_id = %(user_id)s AND d.document_id = %(document_id)s
    """
    with database.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
        cursor.execute(query, {
            'user_id': user_id,
            'document_id': document_id
        })
        first_row = cursor.fetchone()

        if first_row is None:
            return None

        return first_row


def sign_document(user_id, sign_request_id, data):
    """
    Sign a document
    """
    pass


def get_set_info(user_id, set_id):
    """
    Get the info about a document set
    """
    database = get_db()
    query = """
    SELECT row_to_json(qq) FROM (
        SELECT
            %(set_id)s as document_set_id,
            array_to_json(array_agg(row_to_json(q))) as documents
        FROM (
            SELECT d.* FROM document_sets ds
            JOIN documents d ON ds.document_set_id = d.document_set_id
            WHERE ds.user_id = %(user_id)s  AND ds.document_set_id = %(set_id)s
            ) q
        ) qq
    """
    with database.cursor() as cursor:
        cursor.execute(query, {
            'user_id': user_id,
            'set_id': set_id
        })
        data = cursor.fetchone()[0]
        return data
