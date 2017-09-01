import { select, takeEvery, put, take, call, all } from 'redux-saga/effects';
import { SagaMiddleware, delay, eventChannel, END } from 'redux-saga';
import * as Axios from 'axios';
import axios from 'axios';
import { updateDocument, updateDocumentSet, updateDocumentSets, createDocumentSet, updateRequestedSignatures, addPromptToDocument, updateModalData, addOverlays, defineRecipients, updateContacts } from '../actions';
import { addPDFToStore } from '../actions/pdfStore';
import { generateUUID } from '../components/uuid';

import pdfStoreSagas from './pdfStoreSagas';
import signatureSagas from './signatureSagas';
import documentViewerSagas from './documentViewerSagas';


export default function *rootSaga(): any {
    yield all([
        readDocumentSaga(),
        uploadDocumentSaga(),
        requestDocumentSaga(),
        requestDocumentSetSaga(),
        requestDocumentSetsSaga(),
        requestRequestedSignaturesSaga(),
        deleteDocumentSaga(),
        emailDocumentSaga(),
        requestContactsSaga(),
        ...pdfStoreSagas,
        ...signatureSagas,
        ...documentViewerSagas,
    ]);
}

function *readDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.ADD_DOCUMENT, readDocument);

    function *readDocument(action: Sign.Actions.AddDocument) {
        // Update file upload progress
        yield put(updateDocument({ documentId: action.payload.documentId, readStatus: Sign.DocumentReadStatus.InProgress }));

        // Start the file reading process
        const channel = yield call(readFileEmitter, action.payload.file);

        // Wait for the file reader to emit it's result
        const data = yield take(channel);

        yield all([
            // Finish the file upload to the document store
            put(updateDocument({
                documentId: action.payload.documentId,
                data,
                readStatus: Sign.DocumentReadStatus.Complete
            })),

            // Add the document to the PDF store
            put(addPDFToStore({ id: action.payload.documentId, data }))
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
        const document = yield select((state: Sign.State) => state.documents[action.payload.documentId]);
        // prevent anymore requests from going through
        if(document && document.readStatus !== Sign.DocumentReadStatus.NotStarted){
            return;
        }
        yield put(updateDocument({
            documentId: action.payload.documentId,
            readStatus: Sign.DocumentReadStatus.InProgress
        }));
        const response = yield call(axios.get, `/api/document/${action.payload.documentId}`, {responseType: 'arraybuffer'});
        const filename = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(response.headers['content-disposition'])[1].replace(/"/g, '');
        const data = response.data;
        yield all([
            // Finish the file upload to the document store
            put(updateDocument({
                documentId: action.payload.documentId,
                filename,
                data,
                readStatus: Sign.DocumentReadStatus.Complete
            })),

            // Add the document to the PDF store
            put(addPDFToStore({ id: action.payload.documentId, data }))
        ]);
     }
}

function *deleteDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.REMOVE_DOCUMENT, removeDocument);
    function *removeDocument(action: Sign.Actions.RemoveDocument) {
        try {
            const response = yield call(axios.delete, `/api/document/${action.payload.documentId}`);
        } catch(e) {
            //swallow
        }
    }
}


function *requestDocumentSetSaga() {
    yield takeEvery(Sign.Actions.Types.REQUEST_DOCUMENT_SET, requestDocumentSet);

     function *requestDocumentSet(action: Sign.Actions.RequestDocumentSet) {
        let documentSet = yield select((state: Sign.State) => state.documentSets[action.payload.documentSetId]);

        if (!documentSet) {
            yield put(createDocumentSet({ documentSetId: action.payload.documentSetId }))
        }

        documentSet = yield select((state: Sign.State) => state.documentSets[action.payload.documentSetId]);

        if(documentSet.downloadStatus === Sign.DownloadStatus.InProgress){
            return;
        }

        yield put(updateDocumentSet({
            documentSetId: action.payload.documentSetId,
            downloadStatus: Sign.DownloadStatus.InProgress
        }));

        const response = yield call(axios.get, `/api/documents/${action.payload.documentSetId}`);
        const data = response.data || {};

        yield put(updateDocumentSet({
            documentSetId: action.payload.documentSetId,
            downloadStatus: Sign.DownloadStatus.Complete,
            documentIds: (data.documents || []).map((d: any) => d.document_id)
        }));

        if(data.documents){
            const recipients : Sign.Recipients = data.documents.reduce((acc: Sign.Recipients, document: any) => {
                if(document.field_data && document.field_data.recipients){
                    acc = [...acc, ...document.field_data.recipients];
                }
                return acc;
            }, []);

            if(recipients.length){
                yield put(defineRecipients({documentSetId: action.payload.documentSetId, recipients}));
            }

            //todo add new action for mass setting views
            const payload : Sign.Actions.AddOverlaysPayload = data.documents.reduce((acc : any, document: any) => {
                if(document.field_data && document.field_data.view){
                    ['signatures', 'prompts', 'texts', 'dates'].map(k => {
                        Object.keys(document.field_data.view[k]).map(s => {
                            acc[k].push(document.field_data.view[k][s])
                        });
                    });
                }
                return acc;
            }, {
                signatures: [], dates: [], prompts: [], texts: []
            })
            yield put(addOverlays(payload));
        }

    }

}


function *requestDocumentSetsSaga() {
    yield takeEvery(Sign.Actions.Types.REQUEST_DOCUMENT_SETS, requestDocumentSets);

     function *requestDocumentSets(action: Sign.Actions.RequestDocumentSet) {
         const status = yield select((state : Sign.State) => state.documentSetsStatus);
         if(status !== Sign.DownloadStatus.NotStarted && status !== Sign.DownloadStatus.Stale){
             return;
         }
         yield put(updateDocumentSets({
             downloadStatus: Sign.DownloadStatus.InProgress,
             documentSets: []
         }));
        const response = yield call(axios.get, `/api/documents`);

        const data = response.data.map((d : any) => {
            return {createdAt: d.created_at, title: d.name, documentSetId: d.document_set_id,
                documents: (d.documents || [])
                .map((d : any) => ({documentId: d.document_id, createdAt: d.created_at, filename: d.filename, versions: d.versions})) }
        });
        yield put(updateDocumentSets({
            downloadStatus: Sign.DownloadStatus.Complete,
            documentSets: data
        }));
     }
}

function *requestRequestedSignaturesSaga() {
    yield takeEvery(Sign.Actions.Types.REQUEST_REQUESTED_SIGNATURES, requestRequestedSignatures);

     function *requestRequestedSignatures(action: Sign.Actions.RequestRequestedSignatures) {
         const status = yield select((state : Sign.State) => state.requestedSignatures.downloadStatus);
         if(status !== Sign.DownloadStatus.NotStarted && status !== Sign.DownloadStatus.Stale){
             return;
         }
         yield put(updateRequestedSignatures({
             downloadStatus: Sign.DownloadStatus.InProgress,
             documentSets: []
         }));
        const response = yield call(axios.get, `/api/requested_signatures`);

        const data = response.data.map((d : any) => {
            return {createdAt: d.created_at, title: d.name, documentSetId: d.document_set_id, owner: {name: d.requester, user_id: d.user_id},
                documents: (d.documents || [])
                .map((d : any) => ({documentId: d.document_id, createdAt: d.created_at, filename: d.filename, prompts: d.prompts, signRequestId: d.sign_request_id, signStatus: d.sign_status})) }
        });
        yield put(updateRequestedSignatures({
            downloadStatus: Sign.DownloadStatus.Complete,
            documentSets: data
        }));
     }
}

function *emailDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.EMAIL_DOCUMENT, emailDocument);

    function *emailDocument(action: Sign.Actions.EmailDocument) {
        yield put(updateModalData({ status: Sign.DownloadStatus.InProgress }));

        try {
            yield call(axios.post, '/api/send_document', { documentId: action.payload.documentId, recipients: action.payload.recipients });
            yield put(updateModalData({ status: Sign.DownloadStatus.Complete }));
        }
        catch (e) {
            yield put(updateModalData({ status: Sign.DownloadStatus.Failed }));
        }
    }
}

interface ContactsResponse extends Axios.AxiosResponse {
    data: {
        user_id: number;
        name: string;
        email: string;
    }[];
}

function *requestContactsSaga() {
    yield takeEvery(Sign.Actions.Types.REQUEST_CONTACTS, requestContacts);

    function *requestContacts(action: Sign.Actions.RequestContacts) {
        yield put(updateContacts({ status: Sign.DownloadStatus.InProgress }));

        try {
            const response: ContactsResponse = yield call(axios.get, '/api/contacts');

            // Change user_id to id
            const contacts = response.data.map(contact => {
                const { user_id, ...rest } = contact;
                return { id: user_id, ...rest };
            });

            yield put(updateContacts({
                status: Sign.DownloadStatus.Complete,
                contacts
            }));
        }
        catch (e) {
            yield put(updateContacts({ status: Sign.DownloadStatus.Failed }));
        }
    }
}


function *uploadDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.ADD_DOCUMENT, uploadDocument);

    function *uploadDocument(action: Sign.Actions.AddDocument) {
        const document = yield select((state: Sign.State) => state.documents[action.payload.documentId]);
        if(document.uploadStatus !== Sign.DocumentUploadStatus.NotStarted){
            return;
        }

        yield put(updateDocument({
            documentId: action.payload.documentId,
            uploadStatus: Sign.DocumentUploadStatus.InProgress,
            progress: 0
        }));

        // Start the upload process
        const channel = yield call(uploadDocumentProgressEmitter, action.payload.documentSetId, action.payload.documentId, action.payload.file);

        try {
            while (true) {
                let progress = yield take(channel);
                yield put(updateDocument({ documentId: action.payload.documentId, progress }));
            }
        } finally {
            // Set the document upload status to complete
            yield put(updateDocument({
                documentId: action.payload.documentId,
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
