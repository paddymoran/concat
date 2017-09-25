import { all, takeEvery, put, call } from 'redux-saga/effects';
import axios from 'axios';
import { closeModal, resetDocuments, showFailureModal } from '../actions';
import { handleErrors } from './errors';


function *revokeSignInvitationSaga() {
    yield takeEvery(Sign.Actions.Types.REVOKE_SIGN_INVITATION, revokeSignInvitation);

    function *revokeSignInvitation(action: Sign.Actions.RevokeSignInvitation) {
        try {
            yield call(axios.delete, `/api/request_signatures/${action.payload.signRequestId}`);
            yield all([
                put(resetDocuments()),
                put(closeModal({ modalName: Sign.ModalType.CONFIRM_ACTION }))
            ]);
        }
        catch (e) {
            yield all([
                put(resetDocuments()),
                put(closeModal({ modalName: Sign.ModalType.CONFIRM_ACTION }))
            ]);
            const resolved = yield handleErrors(e);
            if(!resolved){
                yield put(showFailureModal({ title: 'Revoke Failed', message: 'Sorry, we were unable to revoke this invitation. Please try again.' }));
            }
        }
    }
}

function *deleteDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.DELETE_DOCUMENT, deleteDocument);

    function *deleteDocument(action: Sign.Actions.DeleteDocument) {
        try {
            yield call(axios.delete, `/api/document/${action.payload.documentId}`);
            yield all([
                put(resetDocuments()),
                put(closeModal({ modalName: Sign.ModalType.CONFIRM_ACTION }))
            ]);
        }
        catch (e) {
            yield all([
                put(resetDocuments()),
                put(closeModal({ modalName: Sign.ModalType.CONFIRM_ACTION }))
            ]);
            const resolved = yield handleErrors(e);
            if(!resolved){
                yield put(showFailureModal({ title: 'Delete Failed', message: 'Sorry, we were unable to delete this document. Please try again.' }));
            }
        }
    }
}

function *deleteDocumentSetSaga() {
    yield takeEvery(Sign.Actions.Types.DELETE_DOCUMENT_SET, deleteDocumentSet);

    function *deleteDocumentSet(action: Sign.Actions.DeleteDocumentSet) {
        try {
            yield call(axios.delete, `/api/documents/${action.payload.documentSetId}`);
            yield all([
                put(resetDocuments()),
                put(closeModal({ modalName: Sign.ModalType.CONFIRM_ACTION }))
            ]);
        }
        catch (e) {
            yield all([
                put(resetDocuments()),
                put(closeModal({ modalName: Sign.ModalType.CONFIRM_ACTION }))
            ]);
            const resolved = yield handleErrors(e);
            if(!resolved){
                yield put(showFailureModal({ title: 'Delete Set Failed', message: 'Sorry, we were unable to delete this document set. Please try again.' }));
            }
        }
    }
}

export default [
    revokeSignInvitationSaga(),
    deleteDocumentSaga(),
    deleteDocumentSetSaga(),
];