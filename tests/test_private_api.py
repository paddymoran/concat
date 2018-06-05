from db import upsert_user, get_user_info
from tests import DBTestCase
import server
import json
import os
from io import BytesIO
from unittest.mock import patch


class TestPrivateAPI(DBTestCase):

    def setUp(self):
        server.app.testing = True
        self.app = server.app.test_client()

    def open_pdf(self, pdf_name):

        test_pdf_path = os.path.join('tests', 'fixtures', 'pdfs', pdf_name)
        with open(test_pdf_path, 'rb') as pdf_data:
            return BytesIO(pdf_data.read())


    def test_0001_upload_document(self):
        USER_ID_1 = 1
        #with server.app.app_context():

        response = self.app.post('/api/catalex/document', content_type='multipart/form-data')
        self.assertEqual(response.status_code, 401)
        response = self.app.post('/api/catalex/document', data={
                                 'UPLOAD_DOCUMENT_SECRET': 'badtestsecret'
                                 }, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 401)
        response = self.app.post('/api/catalex/document', data={
                                 'UPLOAD_DOCUMENT_SECRET': 'testsecret'
                                 }, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 400)
        file = self.open_pdf('phoca-pdf.pdf')
        data = {'file[]': (file, 'phoca-pdf.pdf'), 'UPLOAD_DOCUMENT_SECRET': 'testsecret'}
        response = self.app.post('/api/catalex/document', data=data,
                                 content_type='multipart/form-data')
        self.assertEqual(response.status_code, 400)
        file = self.open_pdf('phoca-pdf.pdf')
        data = {'file[]': (file, 'phoca-pdf.pdf'), 'UPLOAD_DOCUMENT_SECRET': 'testsecret',
        'user_id': 1}

        with patch('api.lookup_user', return_value={
                    'user_id': USER_ID_1,
                    'name': 'documentsetuser',
                    'email': 'documentsetuser@email.com',
                    'subscribed': True
                    }):

            response = self.app.post('/api/catalex/document', data=data,
                                     content_type='multipart/form-data')
        self.assertEqual(response.status_code, 201)