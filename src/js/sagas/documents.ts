import { all, takeEvery, put, call } from 'redux-saga/effects';
import axios from 'axios';
import { closeModal, resetDocuments } from '../actions';

function *revokeSignInvitationSaga() {
    yield takeEvery(Sign.Actions.Types.REVOKE_SIGN_INVITATION, revokeSignInvitation);

    function *revokeSignInvitation(action: Sign.Actions.RevokeSignInvitation) {
        yield call(axios.delete, `/api/request_signatures/${action.payload.signRequestId}`);
        yield all([
            put(resetDocuments()),
            put(closeModal({ modalName: Sign.ModalType.CONFIRM_ACTION }))
        ]);
    }
}

function *deleteDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.DELETE_DOCUMENT, deleteDocument);

    function *deleteDocument(action: Sign.Actions.DeleteDocument) {
        yield call(axios.delete, `/api/document/${action.payload.documentId}`);
        yield all([
            put(resetDocuments()),
            put(closeModal({ modalName: Sign.ModalType.CONFIRM_ACTION }))
        ]);
    }
}

function *deleteDocumentSetSaga() {
    yield takeEvery(Sign.Actions.Types.DELETE_DOCUMENT_SET, deleteDocumentSet);

    function *deleteDocumentSet(action: Sign.Actions.DeleteDocumentSet) {
        yield call(axios.delete, `/api/documents/${action.payload.documentSetId}`);
        yield all([
            put(resetDocuments()),
            put(closeModal({ modalName: Sign.ModalType.CONFIRM_ACTION }))
        ]);
    }
}

export default [
    revokeSignInvitationSaga(),
    deleteDocumentSaga(),
    deleteDocumentSetSaga(),
];