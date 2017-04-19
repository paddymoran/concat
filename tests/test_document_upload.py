from db import  upsert_user, add_document, find_or_create_and_validate_document_set, get_document, get_set_info
from tests import DBTestCase
import uuid
import server
import os

class TestDocumentUpload(DBTestCase):

    def test_documents(self):
        USER_ID = 1
        with server.app.app_context():
            upsert_user({
                        'user_id': USER_ID,
                        'name': 'testuser',
                        'email': 'testuser@email.com'
                        })
            set_id = str(uuid.uuid4())
            find_or_create_and_validate_document_set(set_id, USER_ID)
            with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'fixtures/pdfs/form-pdf.pdf')) as f:
                binary_data = f.read()
                result = add_document(set_id, 'filename', binary_data)

            document_info = get_document(USER_ID, result['document_id'])
            self.assertEqual('dbe5c4a1c0f4d8bd595b4465a81dd4b4adbf16685fd46c5668761b73ecb18de0', document_info['hash'])
            self.assertEqual(binary_data, str(document_info['data']))

            set_info = get_set_info(USER_ID, set_id)

            self.assertEqual(len(set_info['documents']), 1)
            self.assertEqual(set_info['documents'][0]['filename'], 'filename')
