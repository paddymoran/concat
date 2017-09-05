from db import (
    upsert_user, add_document, get_document, get_document_set,
    find_or_create_and_validate_document_set, sign_document,
    add_signature_requests, get_signature_requests
)
from tests import DBTestCase
import server
from io import BytesIO
from uuid import uuid4

class TestSigningFlows(DBTestCase):

    def test_0001_simple_invite(self):
        USER_ID_1 = 2
        USER_ID_2 = 3
        with server.app.app_context():
            upsert_user({
                        'user_id': USER_ID_1,
                        'name': 'documentsetuser',
                        'email': 'documentsetuser@email.com',
                        'subscribed': True
                        })
            upsert_user({
                        'user_id': USER_ID_2,
                        'name': 'invitee',
                        'email': 'invitee@email.com',
                        'subscribed': True
                        })
            set_id = str(uuid4())
            doc1 = str(uuid4())
            sign1 = str(uuid4())

            find_or_create_and_validate_document_set(set_id, USER_ID_1)
            add_document(set_id, doc1, 'input1', b'abc')

            add_signature_requests(set_id,
                                   [{'documentIds': [doc1], 'recipient': {'user_id': USER_ID_2}}])
            requests = get_signature_requests(USER_ID_2)
            self.assertEqual(len(requests), 1)
            sign_request_id = requests[0]['documents'][0]['sign_request_id']
            results = get_document_set(USER_ID_1, set_id)
            self.assertEqual(results['status'], 'Pending')
            add_document(None, sign1, 'sign1', b'abcd')
            sign_document(USER_ID_2, doc1, sign1, sign_request_id, {})
            results = get_document_set(USER_ID_1, set_id)
            self.assertEqual(results['documents'][0]['sign_status'], 'Signed')
            self.assertEqual(results['status'], 'Complete')


    def test_0002_sign_then_invite(self):
        USER_ID_1 = 3
        USER_ID_2 = 4
        with server.app.app_context():
            upsert_user({
                        'user_id': USER_ID_1,
                        'name': 'documentsetuser',
                        'email': 'documentsetuser@email.com',
                        'subscribed': True
                        })
            upsert_user({
                        'user_id': USER_ID_2,
                        'name': 'invitee',
                        'email': 'invitee@email.com',
                        'subscribed': True
                        })
            set_id = str(uuid4())
            doc1 = str(uuid4())
            sign1 = str(uuid4())
            sign2 = str(uuid4())

            find_or_create_and_validate_document_set(set_id, USER_ID_1)
            add_document(set_id, doc1, 'input1', b'abc')
            add_document(None, sign1, 'sign1', b'abcd')
            sign_document(USER_ID_1, doc1, sign1, None, {})
            add_signature_requests(set_id,
                                   [{'documentIds': [doc1], 'recipient': {'user_id': USER_ID_2}}])

            requests = get_signature_requests(USER_ID_2)
            self.assertEqual(len(requests), 1)
            sign_request_id = requests[0]['documents'][0]['sign_request_id']
            results = get_document_set(USER_ID_1, set_id)
            self.assertEqual(results['status'], 'Pending')
            add_document(None, sign2, 'sign1', b'abcd')
            sign_document(USER_ID_2, doc1, sign2, sign_request_id, {})

            results = get_document_set(USER_ID_1, set_id)
            self.assertEqual(results['documents'][0]['sign_status'], 'Signed')
            self.assertEqual(results['status'], 'Complete')


    def test_0003_invite_multiple(self):
        USER_ID_1 = 5
        USER_ID_2 = 6
        USER_ID_3 = 7
        with server.app.app_context():
            upsert_user({
                        'user_id': USER_ID_1,
                        'name': 'documentsetuser',
                        'email': 'documentsetuser@email.com',
                        'subscribed': True
                        })
            upsert_user({
                        'user_id': USER_ID_2,
                        'name': 'invitee',
                        'email': 'invitee@email.com',
                        'subscribed': True
                        })
            upsert_user({
                        'user_id': USER_ID_3,
                        'name': 'invitee',
                        'email': 'invitee@email.com',
                        'subscribed': True
                        })

            set_id = str(uuid4())
            doc1 = str(uuid4())
            sign1 = str(uuid4())
            sign2 = str(uuid4())

            find_or_create_and_validate_document_set(set_id, USER_ID_1)
            add_document(set_id, doc1, 'input1', b'abc')
            add_signature_requests(set_id,
                                   [{'documentIds': [doc1], 'recipient': {'user_id': USER_ID_2}},
                                    {'documentIds': [doc1], 'recipient': {'user_id': USER_ID_3}}])

            # user 2
            requests = get_signature_requests(USER_ID_2)
            self.assertEqual(len(requests), 1)
            sign_request_id = requests[0]['documents'][0]['sign_request_id']

            add_document(None, sign1, 'sign1', b'abcd')
            sign_document(USER_ID_2, doc1, sign1, sign_request_id, {})

            results = get_document_set(USER_ID_1, set_id)
            self.assertEqual(results['documents'][0]['sign_status'], 'Pending')
            self.assertEqual(results['status'], 'Pending')

            # user 3
            requests = get_signature_requests(USER_ID_3)
            self.assertEqual(len(requests), 1)
            sign_request_id = requests[0]['documents'][0]['sign_request_id']

            add_document(None, sign2, 'sign2', b'abcd')
            sign_document(USER_ID_3, doc1, sign2, sign_request_id, {})

            results = get_document_set(USER_ID_1, set_id)
            self.assertEqual(results['documents'][0]['sign_status'], 'Signed')
            self.assertEqual(results['status'], 'Complete')



    def test_0004_invite_multiple_people_multiple_documents_self_sign(self):
        USER_ID_1 = 8
        USER_ID_2 = 9
        USER_ID_3 = 10
        with server.app.app_context():
            upsert_user({
                        'user_id': USER_ID_1,
                        'name': 'documentsetuser',
                        'email': 'documentsetuser@email.com',
                        'subscribed': True
                        })
            upsert_user({
                        'user_id': USER_ID_2,
                        'name': 'invitee',
                        'email': 'invitee@email.com',
                        'subscribed': True
                        })
            upsert_user({
                        'user_id': USER_ID_3,
                        'name': 'invitee',
                        'email': 'invitee@email.com',
                        'subscribed': True
                        })

            set_id = str(uuid4())
            doc1 = str(uuid4())
            doc2 = str(uuid4())
            selfsign1 = str(uuid4())
            sign1 = str(uuid4())
            sign2 = str(uuid4())
            sign3 = str(uuid4())

            find_or_create_and_validate_document_set(set_id, USER_ID_1)
            add_document(set_id, doc1, 'input1', b'abc')
            add_document(set_id, doc2, 'input2', b'abc')
            add_document(None, selfsign1, 'selfsign2', b'abc')

            sign_document(USER_ID_1, doc1, selfsign1, None, {})

            add_signature_requests(set_id,
                                   [{'documentIds': [doc1, doc2], 'recipient': {'user_id': USER_ID_2}},
                                    {'documentIds': [doc1], 'recipient': {'user_id': USER_ID_3}}])

            results = get_document_set(USER_ID_1, set_id)
            self.assertEqual(results['status'], 'Pending')

            # user 2
            requests = get_signature_requests(USER_ID_2)
            self.assertEqual(len(requests), 1)
            sign_request_id_1 = next((d for d in requests[0]['documents'] if d['original_document_id'] == doc1))['sign_request_id']
            sign_request_id_2 = next((d for d in requests[0]['documents'] if d['original_document_id'] == doc2))['sign_request_id']

            add_document(None, sign1, 'sign1', b'abcd')
            add_document(None, sign2, 'sign2', b'abcd')
            sign_document(USER_ID_2, doc1, sign1, sign_request_id_1, {})
            sign_document(USER_ID_2, doc2, sign2, sign_request_id_2, {})

            results = get_document_set(USER_ID_1, set_id)
            for document in results['documents']:
                if doc1 in document['versions']:
                    self.assertEqual(document['sign_status'], 'Pending')
                else:
                    self.assertEqual(document['sign_status'], 'Signed')

            self.assertEqual(results['status'], 'Pending')

            # user 3
            requests = get_signature_requests(USER_ID_3)
            self.assertEqual(len(requests), 1)
            sign_request_id = requests[0]['documents'][0]['sign_request_id']

            add_document(None, sign3, 'sign3', b'abcd')
            sign_document(USER_ID_3, doc1, sign3, sign_request_id, {})

            results = get_document_set(USER_ID_1, set_id)
            self.assertEqual(results['documents'][0]['sign_status'], 'Signed')

            self.assertEqual(results['status'], 'Complete')




