import { select, takeEvery, put, take, call, all } from 'redux-saga/effects';
import { showSessionEndedModal } from '../actions';

export function *handleErrors(e : any) {

    if(e.response && e.response.status === 401 && e.response.data && (e.response.data.type === 'INVALID_TOKEN' || e.response.data.type === 'LOGGED_OUT')){
        yield put(showSessionEndedModal({}))
        return true;
    }

    return false;
}