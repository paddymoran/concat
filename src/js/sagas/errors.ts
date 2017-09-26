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
            yield put(showFailureModal({title: 'Subscription Required', message: 'You have reached the monthly limit for free signing - subscribe today and receive unlimited signing.  Subscriptions cost just $5 per month (when paid annually).', type: e.response.data.type}))
            return true;
        }
    }
    const context = yield select(prepState);
    Raven.captureException(e, {
        extra: context
    });
    return false;
}