import { select, takeEvery, put, call, all } from 'redux-saga/effects';
import * as Promise from 'bluebird';
import * as Axios from 'axios';
import axios from 'axios';
import { selectSignature, hideSignatureSelection } from '../actions/index'

function *signDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.SIGN_DOCUMENT, signDocument);

    function *signDocument(action: Sign.Actions.UploadSignature) {

        // const response = yield call(axios.post, '/api/sign');
        // let signatureId = response.data.signature_id;
    }
}

export default [signDocumentSaga()];