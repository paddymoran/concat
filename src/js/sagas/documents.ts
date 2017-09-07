import { all, takeEvery, put, call } from 'redux-saga/effects';
import axios from 'axios';
import { closeModal, resetDocuments } from '../actions';

function *revokeSignInvitationSaga() {
    yield takeEvery(Sign.Actions.Types.REVOKE_SIGN_INVITATION, revokeSignInvitation);

    function *revokeSignInvitation(action: Sign.Actions.RevokeSignInvitation) {
        yield call(axios.delete, `/api/request_signatures/${action.payload.signRequestId}`);
        yield all([
            put(resetDocuments()),
            put(closeModal({ modalName: Sign.ModalType.CONFIRM_ACTION }))
        ]);
    }
}

export default [
    revokeSignInvitationSaga()
];