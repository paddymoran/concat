import { select, takeEvery, put, call } from 'redux-saga/effects';

function *getPDFFromStore() {
    yield takeEvery(Sign.Actions.Types.GET_PDF_FROM_STORE, task);

    function *task(action: Sign.Actions.IGetPDFFromStoreAction) {
        yield call(console.log, 'dadada');
    }
}



export default [getPDFFromStore];