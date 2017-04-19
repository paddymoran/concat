from db import upsert_user, add_signature, get_signatures_for_user, get_signature
from tests import DBTestCase
import server


class TestPopulateSignatures(DBTestCase):

    def test_login(self):
        with server.app.app_context():
            upsert_user({
                        'user_id': 1,
                        'name': 'signatureuser',
                        'email': 'signatureuser@email.com'
                        })

            add_signature(1, 'abc')
            signatures = get_signatures_for_user(1)
            self.assertEqual(len(signatures), 1)
            self.assertEqual(str(get_signature(signatures[0]['id'], 1)), 'abc')

            add_signature(1, 'abcd')
            signatures = get_signatures_for_user(1)
            self.assertEqual(len(signatures), 2)
