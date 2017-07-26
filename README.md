# Sign
webpack --watch


python server.py config.py


# Dev setup

1. install imagemagick and ghostscript
2. create `catalex_sign` database
3. `npm install`
4. `python setup.py install`
5. `python migrate.py config_dev.py`

**NOTE:** figure out why seed isn't working

python setup.py install

python migrate.py config.py

# Backend tests

CONFIG_FILE=config_test.py python -m unittest discover

### Database

For testing we use a database schema dump to rebuild the database, rather than re-running migrations everytime we want to rebuild.

To generate the dump, run the following command from project root.

`pg_dump catalex_sign --schema-only --no-owner > db_functions/seed.sql`


