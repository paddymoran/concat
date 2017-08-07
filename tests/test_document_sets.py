from db import (
    upsert_user, add_document, get_document, get_document_set,
    find_or_create_and_validate_document_set, sign_document
)
from tests import DBTestCase
import server
from io import BytesIO
from uuid import uuid4

class TestPopulateSignatures(DBTestCase):

    def test_signatures(self):
        USER_ID = 2
        with server.app.app_context():
            upsert_user({
                        'user_id': USER_ID,
                        'name': 'documentsetuser',
                        'email': 'documentsetuser@email.com'
                        })
            set_id = str(uuid4())
            doc1 = str(uuid4())
            doc2 = str(uuid4())

            find_or_create_and_validate_document_set(set_id, USER_ID)
            add_document(set_id, doc1, 'input1', b'abc')
            add_document(set_id, doc2, 'input2', b'edf')
            sign1 = str(uuid4())
            sign2 = str(uuid4())
            add_document(None, sign1, 'sign2', b'abcd')
            add_document(None, sign2, 'sign2', b'abcde')
            sign_document(USER_ID, doc1, sign1, {})
            sign_document(USER_ID, sign1, sign2, {})

            self.assertEqual(len(get_document_set(USER_ID, set_id)['documents']), 2)
