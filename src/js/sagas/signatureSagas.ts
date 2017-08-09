import { takeEvery, put, call, all } from 'redux-saga/effects';
import * as Axios from 'axios';
import axios from 'axios';
import { selectSignature, setSignatureIds, closeShowingModal } from '../actions/index'

interface SignaturesUploadResponse extends Axios.AxiosResponse {
    data: {
        signature_id: number
    };
}

interface SignaturesResponse extends Axios.AxiosResponse {
    data: {
        signature_id: number;
        type: string;
    }[];
}

function *uploadSignature() {
    yield takeEvery(Sign.Actions.Types.UPLOAD_SIGNATURE, task);

    function *task(action: Sign.Actions.UploadSignature) {
        const response : SignaturesUploadResponse = yield axios.post('/api/signatures/upload', { base64Image: action.payload.data, type: action.payload.type });
        let signatureId = response.data.signature_id;
        yield all([
            put(closeShowingModal()),
            put(selectSignature(signatureId))
        ]);
    }
}

function *deleteSignature() {
    yield takeEvery(Sign.Actions.Types.DELETE_SIGNATURE, task);

    function *task(action: Sign.Actions.DeleteSignature) {
        yield axios.delete(`/api/signatures/${action.payload.signatureId}`);
    }
}

function *requestSignaturesSaga() {
    yield takeEvery(Sign.Actions.Types.REQUEST_SIGNATURES, requestSignatures);

    function *requestSignatures(action: Sign.Actions.RequestSignatures) {
        const response: SignaturesResponse = yield call(axios.get, '/api/signatures');

        const signatureIds = response.data.filter(d => d.type === 'signature').map((signature) => signature.signature_id);
        const initialIds = response.data.filter(d => d.type === 'initial').map((signature) => signature.signature_id);

        yield put(setSignatureIds({
            signatureIds,
            initialIds,
            status: Sign.DownloadStatus.Complete
        }));
    }
}

export default [
    uploadSignature(),
    deleteSignature(),
    requestSignaturesSaga(),
];