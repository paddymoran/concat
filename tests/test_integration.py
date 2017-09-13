from tests import DBTestCase
import server
from io import BytesIO
from uuid import uuid4
from flask import session
from db import (
    upsert_user
)

USER_ID = 1

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

        with self.app.session_transaction() as sess:
            # Modify the session in this context block.
            sess["user_id"] = USER_ID

        # now logged in
        index = self.app.get('/')
        self.assertEqual(index.status_code, 200)


    def test_0002_upload_document_set(self):
        # upload document
        # remove it
        # upload another
        # upload a third
        # check /api/documents
        # check /api/documents/<doc_set_id>
        pass


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
        pass

    def test_0005_self_sign_invite_other(self):
        # like above, but with self sign step
        # invite one other, check statuses
        pass

    def test_0006_usage_limits(self):
        # new user, unsubscribed
        # self sign 1 document
        # invite others two a sign another x documents (where x is config.MAX_SIGNS - 1)
        # confirm they can't upload anymore
        # delete sets
        # confirm they still can't upload anymore
        # set them to subscribed
        # confirm they can upload more
        pass

    def test_0007_signature_access(self):
        # new user creates signature
        # new user deletes it
        # new user creates signature
        # gets full list of signatures
        # tests can sign with signature
        # log in as another user
        # confirm cannot request that signature
        # confirm cannot sign with that signature
        # confirm cannot delete that signature
        pass


def test_0008_revoke_requests(self):
    # revoke some requests or sometthing
    pass


