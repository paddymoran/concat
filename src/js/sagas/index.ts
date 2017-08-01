import { select, takeEvery, put, take, call, all } from 'redux-saga/effects';
import { SagaMiddleware, delay, eventChannel, END } from 'redux-saga';
import axios from 'axios';
import { updateDocument } from '../actions';
import { addPDFToStore } from '../actions/pdfStore';
import { generateUUID } from '../components/uuid';

import pdfStoreSagas from './pdfStoreSagas';
import signatureSagas from './signatureSagas';


export default function *rootSaga(): any {
    yield all([
        readDocumentSaga(),
        uploadDocumentSaga(),
        requestDocumentSaga(),
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

function *requestDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.REQUEST_DOCUMENT, requestDocument);

     function *requestDocument(action: Sign.Actions.RequestDocument) {
        const document = yield select((state: Sign.State) => state.documentSet.documents.find(d => d.id === action.payload.id));
        // prevent anymore requests from going through
        if(document && document.readStatus !== Sign.DocumentReadStatus.NotStarted){
            return;
        }
        yield put(updateDocument({
                id: action.payload.id,
                readStatus: Sign.DocumentReadStatus.InProgress
            }));
        const response = yield call(axios.get, `/api/document/${action.payload.id}`, {responseType: 'arraybuffer'});
        const filename = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(response.headers['content-disposition'])[1];
        const data = response.data;
        yield all([
            // Finish the file upload to the document store
            put(updateDocument({
                id: action.payload.id,
                filename,
                data,
                readStatus: Sign.DocumentReadStatus.Complete
            })),

            // Add the document to the PDF store
            put(addPDFToStore({ id: action.payload.id, data }))
        ]);
     }
}



function *uploadDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.ADD_DOCUMENT, uploadDocument);

    function *uploadDocument(action: Sign.Actions.AddDocument) {
        const document = yield select((state: Sign.State) => state.documentSet.documents.find(d => d.id === action.payload.id));
        if(document.uploadStatus !== Sign.DocumentUploadStatus.NotStarted){
            return;
        }
        let documentSetId = yield select((state: Sign.State) => state.documentSet.id);

        if (!documentSetId) {
            documentSetId = yield generateUUID();
        }

        yield put(updateDocument({
            id: action.payload.id,
            uploadStatus: Sign.DocumentUploadStatus.InProgress,
            progress: 0
        }));

        // Start the upload process
        const channel = yield call(uploadDocumentProgressEmitter, documentSetId, action.payload.id, action.payload.file);

        try {
            while (true) {
                let progress = yield take(channel);
                yield put(updateDocument({ id: action.payload.id, progress }));
            }
        } finally {
            // Set the document upload status to complete
            yield put(updateDocument({
                id: action.payload.id,
                uploadStatus: Sign.DocumentUploadStatus.Complete
            }));
        }
    }

    function uploadDocumentProgressEmitter(documentSetId: string, documentId: string, file: File) {
        return eventChannel((emitter) => {
            // Create the form data object for upload
            const data = new FormData();
            data.append('document_set_id', documentSetId);
            data.append('document_id', documentId);
            data.append('file[]', file);

            const onUploadProgress = function(progressEvent: any) {
                // Update uploading percentage
                const progress = progressEvent.loaded / progressEvent.total;
                emitter(progress);
            }

            // Upload the document
            const response = axios.post('/api/documents', data, { onUploadProgress })
                .then((response) => {
                    return emitter(END);
                });

            const unsubscribe = () => {};
            return unsubscribe;
        });
    }
}