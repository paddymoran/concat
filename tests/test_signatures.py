from db import upsert_user, add_signature, get_signatures_for_user, get_signature
from tests import DBTestCase
import server
from io import BytesIO

class TestPopulateSignatures(DBTestCase):

    def test_signatures(self):
        with server.app.app_context():
            upsert_user({
                        'user_id': 1,
                        'name': 'signatureuser',
                        'email': 'signatureuser@email.com'
                        })

            add_signature(1, b'abc')
            signatures = get_signatures_for_user(1)
            self.assertEqual(len(signatures), 1)
            self.assertEqual(get_signature(signatures[0]['id'], 1).tobytes(), b'abc')

            add_signature(1, b'abcd')
            signatures = get_signatures_for_user(1)
            self.assertEqual(len(signatures), 2)
