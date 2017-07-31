import { select, takeEvery, put, take, call, all } from 'redux-saga/effects';
import { SagaMiddleware, delay, eventChannel, END } from 'redux-saga';
import axios from 'axios';
import { updateDocument, uploadDocument } from '../actions';
import { addPDFToStore } from '../actions/pdfStore';

import pdfStoreSagas from './pdfStoreSagas';
import signatureSagas from './signatureSagas';


export default function *rootSaga(): any {
    yield all([
        readDocumentSaga(),
        uploadDocumentSaga(),
        ...pdfStoreSagas,
        ...signatureSagas
    ]);
}


function *readDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.ADD_DOCUMENT, readDocument);

    function *readDocument(action: Sign.Actions.AddDocument) {
        // Update file upload progress
        yield put(updateDocument({ id: action.payload.id, readStatus: Sign.DocumentReadStatus.InProgress }));

        // Start the file reading process
        const channel = yield call(readFileEmitter, action.payload.file);

        // Wait for the file reader to emit it's result
        const data = yield take(channel);

        yield all([
            // Finish the file upload to the document store
            put(updateDocument({
                id: action.payload.id,
                data,
                readStatus: Sign.DocumentReadStatus.Complete
            })),

            // Add the document to the PDF store
            put(addPDFToStore({ id: action.payload.id, data }))
        ]);
    }

    function readFileEmitter(file: File) {
        return eventChannel((emitter) => {
            // Create the file reader and give it the file
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);

            // Add the file reader onload with the event emitters
            fileReader.onload = () => {
                emitter(fileReader.result); // emit the result of the file reader
                emitter(END); // emit the end of this channel
            };

            // Return 'unsubscribe' method
            return () => {
                fileReader.abort();
            };
        });
    }
}

function *uploadDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.ADD_DOCUMENT, uploadDocument);

    function *uploadDocument(action: Sign.Actions.AddDocument) {
        let documentSetId = yield select((state: Sign.State) => ({ documentSetId: state.documentSet.id }));

        debugger;

        yield put(updateDocument({
            id: action.payload.id,
            uploadStatus: Sign.DocumentUploadStatus.InProgress,
            progress: 0
        }));

        // Upload the document to the server
        const data = new FormData();
        data.append('document_set_id', documentSetId);
        data.append('document_id', action.payload.id);
        data.append('file[]', action.payload.file);

        const onUploadProgress = function*(progressEvent: any) {
            // Update uploading percentage
            const percentCompleted = progressEvent.loaded / progressEvent.total;
            yield put(updateDocument({ id: action.payload.id, progress: percentCompleted }));
        }

        // Upload the document
        const response = yield call(axios.post, '/api/documents', data, { onUploadProgress });

        // Set the document upload status to complete
        yield put(updateDocument({
            id: action.payload.id,
            uploadStatus: Sign.DocumentUploadStatus.Complete
        }));
    }

    // function uploadFileEmitter(file: File) {


    //     const unsubscribe = () => {}; // do nothing
    //     return unsubscribe; // return the unsubscribe method
    // }
}