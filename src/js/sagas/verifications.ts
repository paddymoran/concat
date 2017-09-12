import axios from 'axios';
import { all, takeEvery, put, call, select, take } from 'redux-saga/effects';
import { updateVerification } from '../actions';

function *verification() {
    yield takeEvery(Sign.Actions.Types.REQUEST_VERIFICATION, verify);

    function *verify(action: Sign.Actions.UpdateVerification) {
        const verification = yield select((state: Sign.State) => state.verifications[action.payload.hash]);
        if(verification && verification.status && verification.status !== Sign.DownloadStatus.NotStarted) {
            return;
        }
        yield put(updateVerification({status: Sign.DownloadStatus.InProgress, hash: action.payload.hash}));

        try{
            const response = yield call(axios.get, `/api/verify/${action.payload.hash}`);
            const users : Sign.User[] = response.data
            yield put(updateVerification({status: Sign.DownloadStatus.Complete, hash: action.payload.hash, users: users}));
        }
        catch(e) {
            yield put(updateVerification({status: Sign.DownloadStatus.Failed, hash: action.payload.hash}));
        }

    }
}


export default [verification()];