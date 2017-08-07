import { select, takeEvery, put, call, all } from 'redux-saga/effects';
import * as Promise from 'bluebird';
import * as Axios from 'axios';
import axios from 'axios';
import { selectSignature, hideSignatureSelection, setSignatureIds } from '../actions/index'

interface SignaturesUploadResponse extends Axios.AxiosResponse {
    data: {
        signature_id: number
    };
}

interface SignaturesResponse extends Axios.AxiosResponse {
    data: {
        id: number
    }[];
}

function *uploadSignature() {
    yield takeEvery(Sign.Actions.Types.UPLOAD_SIGNATURE, task);

    function *task(action: Sign.Actions.UploadSignature) {
        const response : SignaturesUploadResponse = yield axios.post('/api/signatures/upload', { base64Image: action.payload.data });
        let signatureId = response.data.signature_id;
        yield all([
            put(hideSignatureSelection()),
            put(selectSignature(signatureId))
        ]);
    }
}

function *deleteSignature() {
    yield takeEvery(Sign.Actions.Types.DELETE_SIGNATURE, task);

    function *task(action: Sign.Actions.DeleteSignature) {
        yield axios.delete(`/api/signatures/${action.payload}`);
    }
}

function *requestSignaturesSaga() {
    yield takeEvery(Sign.Actions.Types.REQUEST_SIGNATURES, requestSignatures);

    function *requestSignatures(action: Sign.Actions.RequestSignatures) {
        const response: SignaturesResponse = yield call(axios.get, '/api/signatures');
        const signatureIds = response.data.map((signature) => signature.id);

        yield put(setSignatureIds({
            signatureIds,
            status: Sign.DownloadStatus.Complete
        }));
    }
}

export default [
    uploadSignature(),
    deleteSignature(),
    requestSignaturesSaga(),
];