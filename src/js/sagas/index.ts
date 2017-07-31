import { select, takeEvery, put, take, call, all } from 'redux-saga/effects';
import { SagaMiddleware, delay, eventChannel, END } from 'redux-saga';
import axios from 'axios';
import { updateDocument } from '../actions';
import { addPDFToStore } from '../actions/pdfStore';

import pdfStoreSagas from './pdfStoreSagas';

export default function *rootSaga(): any {
    yield all([
        readDocumentSaga(),
        ...pdfStoreSagas
    ]);
}

function *readDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.ADD_DOCUMENT, readDocument);

    function *readDocument(action: Sign.Actions.AddDocument) {
        // Update file upload progress
        yield put(updateDocument({ id: action.payload.id, readStatus: Sign.DocumentReadStatus.InProgress }));

        const channel = yield call(readFile, action.payload.file);

        const data = yield take(channel);
        
        yield put(updateDocument({
            id: action.payload.id,
            data,
            readStatus: Sign.DocumentReadStatus.Complete
        }));
        
        yield put(addPDFToStore({ id: action.payload.id, data }));
    }
}

function readFile(file: File) {
    return eventChannel((emitter) => {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = () => {
            emitter(fileReader.result);
            emitter(END);
        };

        return () => {};
    });
}