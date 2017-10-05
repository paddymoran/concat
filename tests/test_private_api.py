from db import upsert_user, get_user_info
from tests import DBTestCase
import server
import json

class TestPrivateAPI(DBTestCase):

    def setUp(self):
        server.app.testing = True
        self.app = server.app.test_client()

    def test_0001_upload_document(self):
        with server.app.app_context():
            response = self.app.post('/api/catalex/document')
            self.assertEqual(response.status_code, 401)
            response = self.app.post('/api/catalex/document', data={
                                     'UPLOAD_DOCUMENT_SECRET': 'testsecret'
                                     })
            self.assertEqual(response.status_code, 400)

            #with open('rb') as file:
            #    data = { 'file': file, 'UPLOAD_DOCUMENT_SECRET': 'testsecret' }
            #    response = self.app.post('/api/documents', data=data)
