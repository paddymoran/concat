import { all, takeEvery, put, call, select } from 'redux-saga/effects';
import axios from 'axios';
import { setSignRequestStatus, showResults, closeModal } from '../actions';
import { push } from 'react-router-redux';
import { findSetForDocument } from '../utils';

function *signDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.SIGN_DOCUMENT, signDocument);

    function *signDocument(action: Sign.Actions.SignDocument) {
        yield put(setSignRequestStatus(Sign.DownloadStatus.InProgress));

        const signatures = Object.keys(action.payload.signatures).map(key => action.payload.signatures[key]);

        const postPayload = {
            ...action.payload,
            signatures
        };

        try {
            const response = yield call(axios.post, '/api/sign', postPayload);

            yield all([
                put(setSignRequestStatus(Sign.DownloadStatus.Complete)),

                put(closeModal({ modalName: Sign.ModalType.SIGN_CONFIRMATION })),

                put(push(`/documents/${action.payload.documentSetId}`)),
            ]);
        }
        catch (e) {
            yield all([
                put(closeModal({ modalName: Sign.ModalType.SIGN_CONFIRMATION })),
                put(setSignRequestStatus(Sign.DownloadStatus.Failed))
            ]);
        }
    }
}

export default [signDocumentSaga()];