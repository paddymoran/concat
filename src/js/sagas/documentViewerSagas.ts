import { select, takeEvery, put, call, all } from 'redux-saga/effects';
import * as Promise from 'bluebird';
import * as Axios from 'axios';
import axios from 'axios';

function *signDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.SIGN_DOCUMENT, signDocument);

    function *signDocument(action: Sign.Actions.SignDocument) {
        const response = yield call(axios.post, '/api/sign', action.payload);

        const signedPDFLink = window.location.origin + '/signed-documents/' + response.data.file_id + '?filename=test.pdf';
        window.open(signedPDFLink, '_blank');
    }
}

export default [signDocumentSaga()];