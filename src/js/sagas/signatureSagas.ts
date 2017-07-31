import { select, takeEvery, put, call, all } from 'redux-saga/effects';
import * as Promise from 'bluebird';
import * as Axios from 'axios';
import axios from 'axios';
import { selectSignature, hideSignatureSelection } from '../actions/index'

interface SignaturesUploadResponse extends Axios.AxiosResponse {
    data: {signature_id: number }
}

function *uploadSignature() {
    yield takeEvery(Sign.Actions.Types.UPLOAD_SIGNATURE, task);

    function *task(action: Sign.Actions.UploadSignature) {
        const response : SignaturesUploadResponse = yield axios.post('/api/signatures/upload', { base64Image: action.payload });
        let signatureId = response.data.signature_id;
        yield all([put(hideSignatureSelection()), put(selectSignature(signatureId))]);
    }
}

function *deleteSignature() {
    yield takeEvery(Sign.Actions.Types.DELETE_SIGNATURE, task);

    function *task(action: Sign.Actions.DeleteSignature) {
        yield axios.delete(`/api/signatures/${action.payload}`);
    }
}

export default [uploadSignature(), deleteSignature()];