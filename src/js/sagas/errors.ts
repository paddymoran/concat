import { select, takeEvery, put, take, call, all } from 'redux-saga/effects';
import { showSessionEndedModal } from '../actions';
import * as Raven from 'raven-js';
import { prepState } from '../configureRaven'

export function *handleErrors(e : any) {

    if(e.response && e.response.status === 401 && e.response.data && (e.response.data.type === 'INVALID_TOKEN' || e.response.data.type === 'LOGGED_OUT')){
        yield put(showSessionEndedModal({}))
        return true;
    }
    const context = yield select(prepState);
    Raven.captureException(e, {
        extra: context
    });
    return false;
}