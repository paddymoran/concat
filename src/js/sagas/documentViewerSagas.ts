import { all, takeEvery, put, call, select } from 'redux-saga/effects';
import axios from 'axios';
import { setSignRequestStatus, showResults, closeModal, showFailureModal } from '../actions';
import { push } from 'react-router-redux';
import { findSetForDocument, stringToCanvas } from '../utils';

function *signDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.SIGN_DOCUMENT, signDocument);

    function *signDocument(action: Sign.Actions.SignDocument) {
        const status = yield select((state: Sign.State) => state.documentViewer.signRequestStatus);
        if(status === Sign.DownloadStatus.InProgress){
            return;
        }
        yield put(setSignRequestStatus(Sign.DownloadStatus.InProgress));

        const documentViewer = yield select((state: Sign.State) => state.documentViewer);

        const signatures = Object.keys(documentViewer.signatures).map(key => documentViewer.signatures[key]).filter(signature => signature.documentId === action.payload.documentId);

        const dates = Object.keys(documentViewer.dates).map(key => documentViewer.dates[key]).filter(date => date.documentId === action.payload.documentId);
        const texts = Object.keys(documentViewer.texts).map(key => documentViewer.texts[key]).filter(text => text.documentId === action.payload.documentId);

        const overlays = [...dates, ...texts].map(o => {
            const canvas = stringToCanvas(o.height * 4, o.value);
            const dataUrl = canvas.toDataURL();
            return {...o, dataUrl}
        });

        const postPayload = {
            ...action.payload,
            signatures,
            overlays
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

function *submitSignRequests() {
    yield takeEvery(Sign.Actions.Types.SUBMIT_SIGN_REQUESTS, submit);

    function *submit(action: Sign.Actions.SubmitSignRequests) {
        const status = yield select((state: Sign.State) => state.documentViewer.signRequestStatus);
        if(status === Sign.DownloadStatus.InProgress){
            return;
        }
        yield put(setSignRequestStatus(Sign.DownloadStatus.InProgress));

        try {
            const response = yield call(axios.post, '/api/request_signatures', action.payload);

            yield all([
                put(setSignRequestStatus(Sign.DownloadStatus.Complete)),
                put(closeModal({ modalName: Sign.ModalType.SUBMIT_CONFIRMATION })),
                put(push(`/documents/${action.payload.documentSetId}`)),
            ]);
        }
        catch (e) {
            yield all([
                put(closeModal({ modalName: Sign.ModalType.SUBMIT_CONFIRMATION })),
                put(showFailureModal({message: 'Sorry, we could not send invitations at this time.'})),
                put(setSignRequestStatus(Sign.DownloadStatus.Failed))
            ]);
        }
    }
}

export default [signDocumentSaga(), submitSignRequests()];