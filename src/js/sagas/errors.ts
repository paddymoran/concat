import { select, takeEvery, put, take, call, all } from 'redux-saga/effects';
import { showSessionEndedModal, showFailureModal } from '../actions';
import * as Raven from 'raven-js';
import { prepState } from '../configureRaven'

export function *handleErrors(e : any) {

    if(e.response && e.response.status === 401){
        if(e.response.data && (e.response.data.type === 'INVALID_TOKEN' || e.response.data.type === 'LOGGED_OUT')){
            yield put(showSessionEndedModal({}))
            return true;
        }
        else if(e.response.data && e.response.data.type === 'USAGE_LIMIT_REACHED'){
            yield put(showFailureModal({title: 'Free Account Limit Reached', message: 'Sorry, you have reached your limit for free signing sessions this month.  Upgrade your account for unlimited signing.', type: e.response.data.type}))
            return true;
        }
    }
    const context = yield select(prepState);
    Raven.captureException(e, {
        extra: context
    });
    return false;
}