import { select, takeEvery, put, call } from 'redux-saga/effects';
import { SagaMiddleware, delay } from 'redux-saga';
import axios from 'axios';

import pdfStoreSagas from './pdfStoreSagas';

export default function *rootSaga(): any {
    yield [ ...pdfStoreSagas ];
}