import { takeEvery, takeLatest, put, call, all, select } from 'redux-saga/effects';
import * as Axios from 'axios';
import axios from 'axios';
import { selectSignature, setSignatureIds, closeModal, selectInitial, showFailureModal } from '../actions/index'
import { handleErrors } from './errors';


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
        try {
            const response : SignaturesUploadResponse = yield axios.post('/api/signatures/upload', { base64Image: action.payload.data, type: action.payload.type });
            let signatureId = response.data.signature_id;

            yield put(closeModal({ modalName: 'selectSignature' }));

            // Select the signature or initial
            let selectAction = action.payload.type === Sign.SignatureType.SIGNATURE ? selectSignature(signatureId) : selectInitial({ initialId: signatureId });
            yield put(selectAction);
        }
        catch (e) {
            const resolved = yield handleErrors(e);
            if(!resolved){
                yield put(showFailureModal({ title: 'Upload Signature Failed', message: 'Upload signature failed. Please try again.' }));
            }
        }
    }
}

function *deleteSignature() {
    yield takeEvery(Sign.Actions.Types.DELETE_SIGNATURE, task);

    function *task(action: Sign.Actions.DeleteSignature) {
        try {
            yield axios.delete(`/api/signatures/${action.payload.signatureId}`);
        }
        catch(e) {
            const resolved = yield handleErrors(e);
            if(!resolved){
                yield put(showFailureModal({ title: 'Delete Signature Failed', message: 'Delete signature failed. Please try again.' }));
            }
        }
    }
}

function *requestSignatures(action: Sign.Actions.RequestSignatures) {
    try {
        const status = yield select((state: Sign.State) => state.signatures.status);
        if(status === Sign.DownloadStatus.InProgress){
            return;
        }
        yield put(setSignatureIds({
            signatureIds: [],
            initialIds: [],
            status: Sign.DownloadStatus.InProgress
        }));
        const response: SignaturesResponse = yield call(axios.get, '/api/signatures');
        const signatureIds = response.data.filter(d => d.type === 'signature').map((signature) => signature.signature_id);
        const initialIds = response.data.filter(d => d.type === 'initial').map((signature) => signature.signature_id);

        yield put(setSignatureIds({
            signatureIds,
            initialIds,
            status: Sign.DownloadStatus.Complete
        }));
        const selectedSignature = yield select((state: Sign.State) => state.documentViewer.selectedSignatureId);
        if(signatureIds.length && !selectedSignature) {
            yield put(selectSignature(signatureIds[0]));
        }
        const selectedInitials = yield select((state: Sign.State) => state.documentViewer.selectedInitialId);
        if(initialIds.length && !selectedInitials) {
            yield put(selectInitial({initialId: initialIds[0]}));
        }
    }
    catch (e) {
        //swallow
    }
}


function *requestSignaturesSaga() {
    yield takeEvery(Sign.Actions.Types.REQUEST_SIGNATURES, requestSignatures);

}

export default [
    uploadSignature(),
    deleteSignature(),
    requestSignaturesSaga(),
];