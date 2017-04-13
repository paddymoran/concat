# Sign
webpack --watch

python server.py


#Backend tests

CONFIG_FILE=config_test.py python -m unittest discover

### Database

For testing we use a database schema dump to rebuild the database, rather than re-running migrations everytime we want to rebuild.

To generate the dump, run the following command from project root.

`pg_dump catalex_sign --schema-only --no-owner > db_functions/seed.sql`