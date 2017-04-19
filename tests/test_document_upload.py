from db import  upsert_user, add_document, find_or_create_and_validate_document_set
from tests import DBTestCase
import uuid
import server
import os

class TestDocumentUpload(DBTestCase):

    def test_documents(self):
        with server.app.app_context():
            upsert_user({
                        'user_id': 1,
                        'name': 'testuser',
                        'email': 'testuser@email.com'
                        })
            set_id = str(uuid.uuid4())
            find_or_create_and_validate_document_set(set_id, 1)
            with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'fixtures/pdfs/form-pdf.pdf')) as f:
                result = add_document(set_id, 'filename', f.read())

