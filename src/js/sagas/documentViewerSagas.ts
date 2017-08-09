import { takeEvery, put, call } from 'redux-saga/effects';
import axios from 'axios';
import { setSignRequestStatus, showResults } from '../actions';

function *signDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.SIGN_DOCUMENT, signDocument);

    function *signDocument(action: Sign.Actions.SignDocument) {
        yield put(setSignRequestStatus(Sign.DownloadStatus.InProgress));

        try {
            const response = yield call(axios.post, '/api/sign', action.payload);

            //const signedPDFLink = window.location.origin + '/api/document/' + response.data.document_id;
            //window.open(signedPDFLink, '_blank');

            yield put(setSignRequestStatus(Sign.DownloadStatus.Complete));
            yield put(showResults({ resultDocumentId: response.data.document_id}));
        }
        catch (e) {
            yield put(setSignRequestStatus(Sign.DownloadStatus.Failed));
        }
    }
}

export default [signDocumentSaga()];