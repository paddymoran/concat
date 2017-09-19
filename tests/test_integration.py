from tests import DBTestCase
import server
from io import BytesIO
from uuid import uuid4
from flask import session
from db import (
    upsert_user
)
import os
import json
from io import BytesIO
import base64
from unittest.mock import patch

USER_ID = 1

SIGNATURE_USER_ID = 2
SIGNATURE_STEALER_ID = 3

UPLOAD_DOC_USER_ID = 4
INVITE_OTHERS_USER_1_ID = 5
INVITE_OTHERS_USER_2_ID = 6
INVITE_OTHERS_USER_3_ID = 7

REVOKE_USER_1_ID = 8
REVOKE_OTHER_1_ID = 9
REVOKE_OTHER_2_ID = 10

UNSUBSCRIBED_USER_1 = 11
UNSUBSCRIBED_USER_2 = 12
SUBSCRIBED_USER_1 = 13


PHOCA_PDF_PATH = 'fixtures/pdfs/phoca-pdf.pdf'


class Integration(DBTestCase):

    def setUp(self):
        server.app.testing = True
        self.app = server.app.test_client()
        with server.app.app_context():
            upsert_user({
                        'user_id': USER_ID,
                        'name': 'testuser',
                        'email': 'testuser@email.com',
                        'subscribed': True
                        })
            upsert_user({
                        'user_id': SIGNATURE_USER_ID,
                        'name': 'siggy',
                        'email': 'siggy@email.com',
                        'subscribed': True
                        })
            upsert_user({
                        'user_id': SIGNATURE_STEALER_ID,
                        'name': 'siggy stealer',
                        'email': 'siggystealer@email.com',
                        'subscribed': True
                        })
            upsert_user({
                        'user_id': UPLOAD_DOC_USER_ID,
                        'name': 'asdf asdf',
                        'email': 'asdf@email.com',
                        'subscribed': True
                        })
            upsert_user({
                        'user_id': INVITE_OTHERS_USER_1_ID,
                        'name': 'INVITE_OTHERS_USER_1_ID',
                        'email': 'INVITE_OTHERS_USER_1_ID@email.com',
                        'subscribed': True,
                        'email_verified': True
                        })
            upsert_user({
                        'user_id': INVITE_OTHERS_USER_2_ID,
                        'name': 'INVITE_OTHERS_USER_2_ID',
                        'email': 'INVITE_OTHERS_USER_2_ID@email.com',
                        'subscribed': True,
                        'email_verified': True
                        })
            upsert_user({
                        'user_id': INVITE_OTHERS_USER_3_ID,
                        'name': 'INVITE_OTHERS_USER_3_ID',
                        'email': 'INVITE_OTHERS_USER_3_ID@email.com',
                        'subscribed': True,
                        'email_verified': True
                        })
            upsert_user({
                        'user_id': REVOKE_USER_1_ID,
                        'name': 'REVOKE_USER_1_ID',
                        'email': 'REVOKE_USER_1_ID@email.com',
                        'subscribed': True,
                        'email_verified': True
                        })
            upsert_user({
                        'user_id': REVOKE_OTHER_1_ID,
                        'name': 'REVOKE_OTHER_1_ID',
                        'email': 'REVOKE_OTHER_1_ID@email.com',
                        'subscribed': True,
                        'email_verified': True
                        })
            upsert_user({
                        'user_id': REVOKE_OTHER_2_ID,
                        'name': 'REVOKE_OTHER_2_ID',
                        'email': 'REVOKE_OTHER_2_ID@email.com',
                        'subscribed': True,
                        'email_verified': True
                        })
            upsert_user({
                        'user_id': UNSUBSCRIBED_USER_1,
                        'name': 'UNSUBSCRIBED_USER_1',
                        'email': 'UNSUBSCRIBED_USER_1@email.com',
                        'subscribed': False,
                        'email_verified': True
                        })
            upsert_user({
                        'user_id': UNSUBSCRIBED_USER_2,
                        'name': 'UNSUBSCRIBED_USER_2',
                        'email': 'UNSUBSCRIBED_USER_2@email.com',
                        'subscribed': False,
                        'email_verified': True
                        })
            upsert_user({
                        'user_id': SUBSCRIBED_USER_1,
                        'name': 'SUBSCRIBED_USER_1',
                        'email': 'SUBSCRIBED_USER_1@email.com',
                        'subscribed': True,
                        'email_verified': True
                        })


    def login(self, user_id):
         with self.app.session_transaction() as sess:
            # Modify the session in this context block.
            sess["user_id"] = user_id

    def doc_count(self):
            response = self.app.get('/api/documents')
            data = json.loads(response.get_data(as_text=True))

            if not data:
                return 0

            return len(data[0]['documents'])

    def upload_doc(self, doc_id, set_id, file):
        data = { 'file[]': file, 'document_id': doc_id, 'document_set_id': set_id }
        response = self.app.post('/api/documents', data=data, content_type='multipart/form-data')
        if response.status_code == 200:
            return json.loads(response.get_data(as_text=True))[0]['document_id']
        else:
            raise Exception()

    def add_signature(self):
        current_path = os.path.dirname(os.path.realpath(__file__))
        test_signature_path = os.path.join(current_path, 'fixtures/signatures/sml_sig.png')
        with open(test_signature_path, 'rb') as f:
            signature = 'data:image/png;base64,%s' % base64.b64encode(f.read()).decode('ascii')

        response = self.app.post('/api/signatures/upload', data=json.dumps({'base64Image': signature, 'type': 'signature'}), content_type='application/json')
        response_json = json.loads(response.get_data(as_text=True))
        return response_json['signature_id']

    def sign_with_signature(self, document_id, signature_id, document_set_id=None, sign_request_id=None):
        response = self.app.post('/api/sign', data=json.dumps({'documentId': document_id,
                                                              'documentSetId': document_set_id,
                                                              'signRequestId': sign_request_id,
                                                'signatures': [{
                                                    'signatureId': signature_id,
                                                    'pageNumber': 0,
                                                    'offsetX': 0,
                                                    'offsetY': 0,
                                                    'ratioX': 0.5,
                                                    'ratioY': 0.05
                                                  }]
                                      }), content_type='application/json')
        return response


    def open_pdf(self, pdf_path):
        current_path = os.path.dirname(os.path.realpath(__file__))
        test_pdf_path = os.path.join(current_path, pdf_path)
        with open(test_pdf_path, 'rb') as pdf_data:
            return pdf_data.read()

    def test_0001_protected_routes(self):
        index = self.app.get('/')
        # root does redirect
        self.assertEqual(index.status_code, 302)

        verify = self.app.get('/verify')
        # verify is publically accessible
        self.assertEqual(verify.status_code, 200)

        # try uploading
        upload = self.app.post('/api/documents')
        self.assertEqual(upload.status_code, 401)

        self.login(USER_ID)

        # now logged in
        index = self.app.get('/')
        self.assertEqual(index.status_code, 200)

        self.app.get('/logout')
        index = self.app.get('/')
        # root does redirect
        self.assertEqual(index.status_code, 302)


    def test_0002_upload_document_set(self):
        self.login(UPLOAD_DOC_USER_ID)

        document_set_id = str(uuid4())
        document_ids = [str(uuid4()), str(uuid4()), str(uuid4()), str(uuid4())]

        files = [
            (BytesIO(b'one'), 'file_one.pdf'),
            (BytesIO(b'two'), 'file_two.pdf'),
            (BytesIO(b'three'), 'file_three.pdf')
        ]

        # Upload a document
        self.upload_doc(document_ids[0], document_set_id, files[0])
        self.assertEqual(self.doc_count(), 1) # Check it was uploaded

        # Remove that document
        self.app.delete('/api/document/%s' % document_ids[0])
        self.assertEqual(self.doc_count(), 0) # Check it was deleted

        # Upload two more docs
        self.upload_doc(document_ids[1], document_set_id, files[1])
        self.upload_doc(document_ids[2], document_set_id, files[2])

        # Check both were uploaded
        self.assertEqual(self.doc_count(), 2)



    def test_0003_sign_and_verify_document(self):
        # upload document
        # sign it with overlay (read a fixture file, base64 encoded)
        # get result
        # verify document
        # delete document
        # confirm document set gone
        # verify document again
        pass

    def test_0004_invite_others(self):
        # upload document
        # invite two others to sign it
        # check pending status
        # log in as another
        # check signature_requests

        # sign document
        # check signature_requests
        # log in as third
        # check signature_requests
        # reject it
        # check signature_requests
        # log in as first
        # check complete status
        # check contacts

        ##
        ## Login as user 1
        ##
        self.login(INVITE_OTHERS_USER_1_ID)

        # Upload a document
        document_set_id = str(uuid4())
        document_id = str(uuid4())

        uploaded_doc_id = self.upload_doc(document_id, document_set_id, (BytesIO(self.open_pdf(PHOCA_PDF_PATH)), 'file.pdf'))

        # Invite some users
        invite_request_data = {
            'documentSetId': document_set_id,
            'signatureRequests': [{
                'documentIds': [uploaded_doc_id],
                'recipient': {
                    'name': 'INVITE_OTHERS_USER_2_ID',
                    'email': 'INVITE_OTHERS_USER_2_ID@email.com'
                }
            }, {
                'documentIds': [uploaded_doc_id],
                'recipient': {
                    'name': 'INVITE_OTHERS_USER_3_ID',
                    'email': 'INVITE_OTHERS_USER_3_ID@email.com'
                }
            }]
        }

        invitees = [
            {'id': INVITE_OTHERS_USER_2_ID, 'name': 'INVITE_OTHERS_USER_2_ID', 'email': 'INVITE_OTHERS_USER_2_ID@email.com'},
            {'id': INVITE_OTHERS_USER_3_ID, 'name': 'INVITE_OTHERS_USER_3_ID', 'email': 'INVITE_OTHERS_USER_3_ID@email.com'},
        ]

        with patch('server.invite_users', return_value=invitees):
            self.app.post('/api/request_signatures', data=json.dumps(invite_request_data), content_type='application/json')

        # Check the doc status is pending
        response = self.app.get('/api/documents/%s' % document_set_id)
        response_json = json.loads(response.get_data(as_text=True))
        self.assertEqual(response_json['status'], 'Pending')

        ##
        ## Login as user 2
        ##
        self.login(INVITE_OTHERS_USER_2_ID)

        # Check requested signatures
        response = self.app.get('/api/requested_signatures')
        response_json = json.loads(response.get_data(as_text=True))

        # Check only one sign request has been made
        self.assertEqual(len(response_json), 1)

        sign_request = response_json[0]

        self.assertEqual(sign_request['document_set_id'], document_set_id)
        self.assertEqual(sign_request['is_owner'], False)
        self.assertEqual(sign_request['requester'], 'INVITE_OTHERS_USER_1_ID')
        self.assertEqual(sign_request['user_id'], INVITE_OTHERS_USER_1_ID) # Check the requester id


        documents = sign_request['documents']
        self.assertEqual(len(documents), 1) # Check only one document is in the sign request

        document = documents[0]

        self.assertEqual(document['document_id'], document_id)
        self.assertEqual(document['original_document_id'], document_id)

        # Sign the document
        user_2_signature_id = self.add_signature()

        sign_data = {
            'documentSetId': document_set_id,
            'documentId': document_id,
            'signatures': [{
                'signatureIndex': 'dunno tbh',
                'signatureId': user_2_signature_id,
                'xyRatio': 2.158,
                'document_id': document_id,
                'pageNumber': 0,
                'offsetX': .5,
                'offsetY': .5,
                'ratioX': .2,
                'ratioY': .1
            }],
            'overlays': [],
            'reject': False,
            'signRequestId': document['sign_request_id']
        }


        # with patch('server.send_completion_email'):
        #     response = self.app.post('/api/sign', data=json.dumps(sign_data), content_type='application/json')
        # print(response)



    def test_0005_self_sign_invite_other(self):
        # like above, but with self sign step
        # invite one other, check statuses
        pass

    def test_0006_usage_limits(self):
        amount_per_unit = server.app.config.get('MAX_SIGNS')
        max_sign_unit = server.app.config.get('MAX_SIGN_UNIT')

        self.login(UNSUBSCRIBED_USER_1)
        data = json.loads(self.app.get('/api/usage').get_data(as_text=True))

        self.assertEqual(data['requested_this_unit'], 0)
        self.assertEqual(data['max_allowance_reached'], False)
        self.assertEqual(data['amount_per_unit'], amount_per_unit)
        self.assertEqual(data['unit'], max_sign_unit)
        self.assertEqual(data['signed_this_unit'], 0)


        # upload 1 document
        document_set_id = str(uuid4())
        document_id = str(uuid4())
        self.upload_doc(document_id, document_set_id, (BytesIO(self.open_pdf(PHOCA_PDF_PATH)), 'file.pdf'))
        data = json.loads(self.app.get('/api/usage').get_data(as_text=True))
        self.assertEqual(data['max_allowance_reached'], False)
        self.assertEqual(data['signed_this_unit'], 0)
        signature_id = self.add_signature()
        self.sign_with_signature(document_id, signature_id)
        data = json.loads(self.app.get('/api/usage').get_data(as_text=True))
        self.assertEqual(data['signed_this_unit'], 1)

        # upload 2 in a set
        document_set_id = str(uuid4())
        document_id_1 = str(uuid4())
        document_id_2 = str(uuid4())
        self.upload_doc(document_id_1, document_set_id, (BytesIO(self.open_pdf(PHOCA_PDF_PATH)), 'file.pdf'))
        self.upload_doc(document_id_2, document_set_id, (BytesIO(self.open_pdf(PHOCA_PDF_PATH)), 'file.pdf'))
        data = json.loads(self.app.get('/api/usage').get_data(as_text=True))
        self.assertEqual(data['max_allowance_reached'], False)
        self.assertEqual(data['signed_this_unit'], 1)
        signature_id = self.add_signature()
        self.sign_with_signature(document_id, signature_id)
        data = json.loads(self.app.get('/api/usage').get_data(as_text=True))
        self.sign_with_signature(document_id_1, signature_id)
        data = json.loads(self.app.get('/api/usage').get_data(as_text=True))
        self.assertEqual(data['signed_this_unit'], 2)
        self.sign_with_signature(document_id_2, signature_id)
        data = json.loads(self.app.get('/api/usage').get_data(as_text=True))
        self.assertEqual(data['signed_this_unit'], 2)

        # upload 1 document again
        document_set_id = str(uuid4())
        document_id = str(uuid4())
        self.upload_doc(document_id, document_set_id, (BytesIO(self.open_pdf(PHOCA_PDF_PATH)), 'file.pdf'))
        data = json.loads(self.app.get('/api/usage').get_data(as_text=True))
        self.assertEqual(data['max_allowance_reached'], False)
        signature_id = self.add_signature()
        self.sign_with_signature(document_id, signature_id)
        data = json.loads(self.app.get('/api/usage').get_data(as_text=True))
        self.assertEqual(data['signed_this_unit'], 3)
        self.assertEqual(data['max_allowance_reached'], True)
        with self.assertRaises(Exception):
            self.upload_doc(document_id, document_set_id, (BytesIO(self.open_pdf(PHOCA_PDF_PATH)), 'file.pdf'))


        # pair wise limitation



    def test_0007_signature_access(self):
        # new user creates signature
        self.login(SIGNATURE_USER_ID)
        current_path = os.path.dirname(os.path.realpath(__file__))
        test_signature_path = os.path.join(current_path, 'fixtures/signatures/sml_sig.png')
        with open(test_signature_path, 'rb') as f:
            signature = 'data:image/png;base64,%s' % base64.b64encode(f.read()).decode('ascii')
        self.app.post('/api/signatures/upload', data=json.dumps({'base64Image': signature, 'type': 'signature'}),
                      content_type='application/json')
        response = self.app.get('/api/signatures')
        data = json.loads(response.get_data(as_text=True))
        self.assertEqual(len(data), 1)

        # new user deletes it
        response = self.app.delete('/api/signatures/%s' % data[0]['signature_id'])
        data = json.loads(response.get_data(as_text=True))
        self.assertEqual(len(data), 0)

        # new user creates signature

        with open(test_signature_path, 'rb') as f:
            signature = 'data:image/png;base64,%s' % base64.b64encode(f.read()).decode('ascii')
        self.app.post('/api/signatures/upload', data=json.dumps({'base64Image': signature, 'type': 'signature'}),
                      content_type='application/json')
        response = self.app.get('/api/signatures')
        # gets full list of signatures
        data = json.loads(response.get_data(as_text=True))
        signature_id = data[0]['signature_id']

        response = self.app.get('/api/signatures/%s' % signature_id)

        self.assertEqual(response.status_code, 200)

        # tests can sign with signature
        test_pdf_path = os.path.join(current_path, 'fixtures/pdfs/phoca-pdf.pdf')
        document_id = str(uuid4())
        document_set_id = str(uuid4())
        with open(test_pdf_path, 'rb') as f:
            response = self.app.post('/api/documents',
                                     data={'file[]': (BytesIO(f.read()), 'my file.pdf'),
                                           'document_id': document_id,
                                           'document_set_id': document_set_id},
                                     content_type='multipart/form-data')
        data = json.loads(response.get_data(as_text=True))
        document_id = data[0]['document_id']

        response = self.sign_with_signature(document_id, signature_id)

        self.assertEqual(response.status_code, 200)

        # log in as another user
        # confirm cannot request that signature
        self.login(SIGNATURE_STEALER_ID)
        response = self.app.get('/api/signatures/%s' % signature_id)
        self.assertEqual(response.status_code, 404)
        # confirm cannot delete that signature
        response = self.app.delete('/api/signatures/%s' % signature_id)
        self.assertEqual(response.status_code, 404)

        # confirm cannot sign with that signature
        document_id = str(uuid4())
        document_set_id = str(uuid4())
        with open(test_pdf_path, 'rb') as f:
            response = self.app.post('/api/documents',
                                     data={'file[]': (BytesIO(f.read()), 'my file.pdf'),
                                           'document_id': document_id,
                                           'document_set_id': document_set_id},
                                     content_type='multipart/form-data')
        data = json.loads(response.get_data(as_text=True))
        document_id = data[0]['document_id']

        response = self.sign_with_signature(document_id, signature_id)
        self.assertEqual(response.status_code, 401)


    def test_0008_revoke_requests(self):
        # revoke some requests or sometthing
        self.login(REVOKE_USER_1_ID)
        # Upload a document
        document_set_id = str(uuid4())
        document_id = str(uuid4())

        uploaded_doc_id = self.upload_doc(document_id, document_set_id, (BytesIO(self.open_pdf(PHOCA_PDF_PATH)), 'file.pdf'))

        # Invite some users
        invite_request_data = {
            'documentSetId': document_set_id,
            'signatureRequests': [{
                'documentIds': [uploaded_doc_id],
                'recipient': {
                    'name': 'REVOKE_OTHER_1_ID',
                    'email': 'REVOKE_OTHER_1_ID@email.com'
                }
            }, {
                'documentIds': [uploaded_doc_id],
                'recipient': {
                    'name': 'REVOKE_OTHER_2_ID',
                    'email': 'REVOKE_OTHER_2_ID@email.com'
                }
            }]
        }
        invitees = [
            {'id': REVOKE_OTHER_1_ID, 'name': 'REVOKE_OTHER_1_ID', 'email': 'REVOKE_OTHER_1_ID@email.com'},
            {'id': REVOKE_OTHER_2_ID, 'name': 'REVOKE_OTHER_2_ID', 'email': 'REVOKE_OTHER_2_ID@email.com'}
        ]

        with patch('server.invite_users', return_value=invitees):
            self.app.post('/api/request_signatures', data=json.dumps(invite_request_data), content_type='application/json')

        response = self.app.get('/api/documents/%s' % document_set_id)
        response_json = json.loads(response.get_data(as_text=True))
        requests = response_json['documents'][0]['request_info']
        self.assertEqual(len(requests), 2)

        self.login(REVOKE_OTHER_1_ID)
        revoke = self.app.delete('/api/request_signatures/%s' % requests[0]['sign_request_id'])
        self.assertEqual(revoke.status_code, 401)
        response = self.sign_with_signature(document_id, self.add_signature(), document_set_id=document_set_id, sign_request_id=requests[0]['sign_request_id'])

        self.assertEqual(response.status_code, 200)

        with patch('server.send_email', return_value=True) as p:
            self.login(REVOKE_USER_1_ID)
            revoke = self.app.delete('/api/request_signatures/%s' % requests[1]['sign_request_id'])
            self.assertEqual(revoke.status_code, 200)
            self.login(REVOKE_OTHER_2_ID)
            p.assert_called()

