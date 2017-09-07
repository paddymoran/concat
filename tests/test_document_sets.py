from db import (
    upsert_user, add_document, get_document, get_document_set, get_user_document_sets,
    find_or_create_and_validate_document_set, sign_document,
    remove_document_from_set
)
from tests import DBTestCase
import server
from io import BytesIO
from uuid import uuid4
import json


class TestPopulateDocumentSets(DBTestCase):

    def test_signing(self):
        USER_ID = 2
        with server.app.app_context():
            upsert_user({
                        'user_id': USER_ID,
                        'name': 'documentsetuser',
                        'email': 'documentsetuser@email.com',
                        'subscribed': True
                        })
            set_id = str(uuid4())
            doc1 = str(uuid4())
            doc2 = str(uuid4())

            find_or_create_and_validate_document_set(set_id, USER_ID)
            add_document(set_id, doc1, 'input1', b'abc')
            add_document(set_id, doc2, 'input2', b'edf')
            sign1 = str(uuid4())
            sign2 = str(uuid4())
            add_document(None, sign1, 'sign1', b'abcd')
            add_document(None, sign2, 'sign2', b'abcde')
            results = get_document_set(USER_ID, set_id)
            for doc in results['documents']:
                self.assertEqual(doc['sign_status'], 'Pending')
            self.assertEqual(results['status'], 'Pending')
            sign_document(USER_ID, doc1, sign1, None, {})
            results = get_document_set(USER_ID, set_id)
            self.assertEqual(results['status'], 'Pending')
            for doc in results['documents']:
                if doc1 in doc['versions']:
                    self.assertEqual(doc['sign_status'], 'Signed')
                else:
                    self.assertEqual(doc['sign_status'], 'Pending')
            sign_document(USER_ID, doc2, sign2, None, {})
            results = get_document_set(USER_ID, set_id)
            self.assertEqual(results['status'], 'Complete')
            for doc in results['documents']:
                self.assertEqual(doc['sign_status'], 'Signed')

            self.assertEqual(len(get_document_set(USER_ID, set_id)['documents']), 2)


    def test_deleting(self):
        USER_ID = 3
        with server.app.app_context():
            upsert_user({
                        'user_id': USER_ID,
                        'name': 'documentsetuser',
                        'email': 'documentsetuser@email.com',
                        'subscribed': True
                        })
            set_id = str(uuid4())
            doc1 = str(uuid4())
            sets = get_user_document_sets(USER_ID)
            self.assertEqual(len(sets), 0)

            find_or_create_and_validate_document_set(set_id, USER_ID)
            add_document(set_id, doc1, 'input1', b'abc')
            sets = get_user_document_sets(USER_ID)
            self.assertEqual(len(sets), 1)

            remove_document_from_set(USER_ID, doc1)
            sets = get_user_document_sets(USER_ID)
            self.assertEqual(len(sets), 0)

