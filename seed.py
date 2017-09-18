from __future__ import print_function
import importlib
import sys
import psycopg2
import os


def seed(db):
    for filename in files + ['seed.sql']:
        with open(os.path.join('db_functions', filename)) as f, db.cursor() as cur:
            print('Running', filename)
            sql = f.read()
            cur.execute(sql)
    db.commit()



def connect_db(config):
    return psycopg2.connect(
        database=config.DB_NAME,
        user=config.DB_USER,
        host=config.DB_HOST,
        password=config.DB_PASS)


def populate_migrations(db):
    files = set([f for f in os.listdir('migrations') if not f.startswith('_') and not f.endswith('.pyc')])
    with db.cursor() as cur:
        for filename in files:
            cur.execute("INSERT INTO migrations (name) VALUES (%(filename)s) ", {
                'filename': filename
            })



def run():
    if not len(sys.argv) > 1:
        raise Exception('Missing configuration file')
    config = importlib.import_module(sys.argv[1].replace('.py', ''))
    db = connect_db(config)
    seed(db)
    populate_migration(db)

    db.commit()
    print('Seed Complete')


if __name__ == '__main__':
    run()
