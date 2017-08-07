from db import (
    upsert_user, add_document, get_document, get_document_set,
    find_or_create_and_validate_document_set
)
from tests import DBTestCase
from uuid import uuid4
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
            set_id = str(uuid4())
            document_id = str(uuid4())
            find_or_create_and_validate_document_set(set_id, USER_ID)

            current_path = os.path.dirname(os.path.realpath(__file__))
            test_pdf_path = os.path.join(
                current_path, 'fixtures/pdfs/form-pdf.pdf'
            )

            with open(test_pdf_path, 'rb') as f:
                binary_data = f.read()
                result = add_document(
                    set_id, document_id, 'filename', binary_data
                )

            document_info = get_document(USER_ID, result['document_id'])
            expected_hash = "dbe5c4a1c0f4d8bd595b4465a81dd4b4adbf16685fd46c5668761b73ecb18de0"
            self.assertEqual(expected_hash, document_info['hash'])
            self.assertEqual(binary_data, document_info['data'].tobytes())

            set_info = get_document_set(USER_ID, set_id)

            self.assertEqual(len(set_info['documents']), 1)
            self.assertEqual(set_info['documents'][0]['filename'], 'filename')
