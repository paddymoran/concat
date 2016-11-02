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

def create_missing_tables():
    with connect_db().cursor() as cur:
        cur.execute("""
            
        """)
        db.commit()
        return true;


def add_signature(userId):
    with get_db().cursor() as cursor:
        try:
            cur.execute('INSERT INTO user_logins (user_id, access_hash, access_time) VALUES (%(user_id)s, \'%(access_hash)s\', NOW())', {
                'user_id': data['id'],
                'access_hash': hash(request.headers.get('user_agent') + request.remote_addr)
            })
            db.commit()
        except Exception:
            # User might be already logged in with this device/IP, ignore
            db.rollback()


def get_document_from_title(title):
    with get_db().cursor() as cur:
        cur.execute("""
            select title as name, q.type, document from
                ((select trim(full_citation) as title, 'case' as type, null as document_id from cases
            where trim(full_citation) = %(title)s
                )
                union
                (select trim(title) as title, 'act' as type, document_id from acts
            where title = %(title)s
            order by version desc limit 1
                )
                union
                (select trim(title) as title, 'regulation' as type, document_id from regulations
            where title = %(title)s
            order by version desc limit 1
                )) q
            left outer join documents d on q.document_id = d.id
            """, {'title': title})
        return cur.fetchone()
