from db import upsert_user, get_user_info
from tests import DBTestCase
import server


class TestPopulateLogin(DBTestCase):

    def test_login(self):
        with server.app.app_context():
            upsert_user({
                        'user_id': 1,
                        'name': 'testuser',
                        'email': 'testuser@email.com'
                        })
            upsert_user({
                        'user_id': 1,
                        'name': 'testusery',
                        'email': 'testuser@email.com'
                        })
            self.assertEqual(get_user_info(1)['name'], 'testusery')
