import unittest
from db import get_db, close_db
from migration import load_functions
import server
from flask import current_app


class DBTestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        with server.app.app_context():
            load_functions(get_db(), ['drop.sql', 'seed.sql'])

    @classmethod
    def tearDownClass(cls):
        with server.app.app_context():
            close_db()