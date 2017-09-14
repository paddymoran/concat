import { select, takeEvery, put, take, call, all } from 'redux-saga/effects';
import { SagaMiddleware, delay, eventChannel, END } from 'redux-saga';
import * as Axios from 'axios';
import axios from 'axios';
import { updateDocument, updateDocumentSet, updateDocumentSets, createDocumentSet, updateRequestedSignatures,
    addPromptToDocument, updateModalData, addOverlays, defineRecipients, updateContacts, updateUsage, removeDocument, showFailureModal, showSignConfirmationModal } from '../actions';
import { addPDFToStore } from '../actions/pdfStore';
import { generateUUID } from '../components/uuid';

import pdfStoreSagas from './pdfStoreSagas';
import signatureSagas from './signatureSagas';
import documentViewerSagas from './documentViewerSagas';
import documentSagas from './documents';
import verificationsSagas from './verifications';
import { formatUsage } from '../utils'


function shouldFetch(status: Sign.DownloadStatus){
    return [
        Sign.DownloadStatus.NotStarted,
        Sign.DownloadStatus.Failed,
        Sign.DownloadStatus.Stale
    ].indexOf(status) >= 0;
}

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
        requestUsageSaga(),
        finishedSigningDocumentSaga(),
        ...pdfStoreSagas,
        ...signatureSagas,
        ...documentViewerSagas,
        ...documentSagas,
        ...verificationsSagas
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

        // Set read status to 'In Progress' and download progress to 0
        yield put(updateDocument({
            documentId: action.payload.documentId,
            readStatus: Sign.DocumentReadStatus.InProgress,
            downloadProgress: 0,
        }));

        const channel = yield call(requestDocumentProgressEmitter, action.payload.documentId);
        let state: any;

        try {
            while (true) {
                state = yield take(channel);
                yield put(updateDocument({ documentId: action.payload.documentId, ...state }));
            }
        }
        catch(e) {
            // swallow
        }
        finally {
            const filename = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(state.headers['content-disposition'])[1].replace(/"/g, '');
            const data = state.data;
            yield all([
                // Finish the file upload to the document store
                put(updateDocument({
                    documentId: action.payload.documentId,
                    filename,
                    data,
                    readStatus: Sign.DocumentReadStatus.Complete,
                    downloadProgress: 1
                })),
                // Add the document to the PDF store
                put(addPDFToStore({ id: action.payload.documentId, data }))
            ]);
        }
     }

    function requestDocumentProgressEmitter(documentId: string) {
        return eventChannel(function(emitter) {
            // Progress handler
            const onDownloadProgress = function(progressEvent: any) {
                const downloadProgress = progressEvent.loaded / progressEvent.total;
                emitter({ downloadProgress });
            }

            // Make the download request with the progress handler
            axios.get(`/api/document/${documentId}`, { responseType: 'arraybuffer' })
                .then(response => {
                    emitter(response);
                    emitter(END);
                });

            const unsubscribe = function() {};
            return unsubscribe;
        });
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

function formatRequests(r: any) : Sign.SignatureRequestInfos {
    if(r){
        return r.map((r: any) => ({userId: r.user_id, name: r.name, email: r.email, status: r.status, signRequestId: r.sign_request_id, rejectedMessage: r.rejection_explaination ? r.rejection_explaination.rejectedMessage : null}))
    }
}


function formatDocument(d: any){
    return {
        documentId: d.document_id,
        createdAt: d.created_at,
        filename: d.filename,
        versions: d.versions,
        signStatus: d.sign_status,
        signatureRequestInfos: formatRequests(d.request_info),
        size: d.size
    };
}

function formatDocumentSet(d: any): Sign.Actions.DocumentSetPayload {
    return {
        createdAt: d.created_at,
        title: d.name,
        documentSetId: d.document_set_id,
        isOwner: d.is_owner,
        documents: (d.documents || []).map(formatDocument),
        downloadStatus: Sign.DownloadStatus.Complete,
        size: d.size
    };
}

function *requestDocumentSetSaga() {
    yield takeEvery(Sign.Actions.Types.REQUEST_DOCUMENT_SET, requestDocumentSet);

     function *requestDocumentSet(action: Sign.Actions.RequestDocumentSet) {
        let documentSet = yield select((state: Sign.State) => state.documentSets[action.payload.documentSetId]);

        if (!documentSet) {
            yield put(createDocumentSet({ documentSetId: action.payload.documentSetId }))
        }

        documentSet = yield select((state: Sign.State) => state.documentSets[action.payload.documentSetId]);

        if (documentSet.downloadStatus === Sign.DownloadStatus.InProgress) {
            return;
        }

        yield put(updateDocumentSet({
            documentSetId: action.payload.documentSetId,
            downloadStatus: Sign.DownloadStatus.InProgress
        }));

        const response = yield call(axios.get, `/api/documents/${action.payload.documentSetId}`);
        const data = response.data;

        if (data) {
            yield put(updateDocumentSet(formatDocumentSet(data)));
        }
        else {
            yield put(updateDocumentSet({
                isOwner: true,
                documents: [],
                downloadStatus: Sign.DownloadStatus.Complete,
                documentSetId: action.payload.documentSetId
            }));
        }

        if (data && data.documents) {
            const recipients : Sign.Recipients = data.documents.reduce((acc: Sign.Recipients, document: any) => {
                if(document.field_data && document.field_data.recipients){
                    acc = [...acc, ...document.field_data.recipients];
                }
                return acc;
            }, []);

            if(recipients.length){
                yield put(defineRecipients({documentSetId: action.payload.documentSetId, recipients}));
            }

            const payload: Sign.Actions.AddOverlaysPayload = data.documents.reduce((acc : any, document: any) => {
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

        if (status !== Sign.DownloadStatus.NotStarted && status !== Sign.DownloadStatus.Stale) {
            return;
        }

        yield put(updateDocumentSets({
            downloadStatus: Sign.DownloadStatus.InProgress,
            documentSets: []
        }));

        const response = yield call(axios.get, `/api/documents`);

        const data = response.data.map(formatDocumentSet);

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

        const data = response.data.map((d : any) => ({
            createdAt: d.created_at,
            title: d.name,
            documentSetId: d.document_set_id,
            owner: {name: d.requester, user_id: d.user_id},
            isOwner: d.is_owner,
            documents: (d.documents || []).map((d: any) => ({
                documentId: d.document_id,
                createdAt: d.created_at,
                filename: d.filename,
                prompts: (d.prompts || []).map((p: Sign.DocumentPrompt) => {
                    return {...p, documentId: d.document_id}
                }),
                signRequestId: d.sign_request_id,
                signStatus: d.sign_status,
                size: d.size
            }))
        }));

        yield put(updateRequestedSignatures({
            downloadStatus: Sign.DownloadStatus.Complete,
            documentSets: data
        }));
     }
}

function *emailDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.EMAIL_DOCUMENT, emailDocuments);

    function *emailDocuments(action: Sign.Actions.EmailDocuments) {
        yield put(updateModalData({ status: Sign.DownloadStatus.InProgress }));

        try {
            yield call(axios.post, '/api/send_documents', { documentIds: action.payload.documentIds, recipients: action.payload.recipients });
            yield put(updateModalData({ status: Sign.DownloadStatus.Complete }));
        }
        catch (e) {
            yield put(updateModalData({ status: Sign.DownloadStatus.Failed }));
        }
    }
}


function *requestContactsSaga() {
    interface ContactsResponse extends Axios.AxiosResponse {
        data: {
            user_id: number;
            name: string;
            email: string;
        }[];
    }

    yield takeEvery(Sign.Actions.Types.REQUEST_CONTACTS, requestContacts);

    function *requestContacts(action: Sign.Actions.RequestContacts) {
        const status = yield select((state: Sign.State) => state.contacts.status);
        if(!shouldFetch(status)){
            return;
        }
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

function *requestUsageSaga() {
    interface UsageResponse extends Axios.AxiosResponse {
        data: {
            amount_per_unit: number;
            max_allowance_reached: boolean;
            requested_this_unit: number;
            signed_this_unit: number;
            unit: string;
        };
    }

    yield takeEvery(Sign.Actions.Types.REQUEST_USAGE, requestUsage);

    function *requestUsage(action: Sign.Actions.RequestUsage) {
        const status = yield select((state: Sign.State) => state.usage.status);
        if(!shouldFetch(status)){
            return;
        }

        yield put(updateUsage({ status: Sign.DownloadStatus.InProgress }));

        try {
            const response: UsageResponse = yield call(axios.get, '/api/usage');


            yield put(updateUsage(formatUsage(response.data)));
        }
        catch (e) {
            yield put(updateUsage({ status: Sign.DownloadStatus.Failed }));
        }
    }
}
/*
import * as shajs from 'sha.js'
const sha256 = shajs('sha256');
        console.log(sha256.update(action.payload.file).digest('hex'));*/

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
        let state : any;
        try {
            while (true) {
                state = yield take(channel);
                yield put(updateDocument({ documentId: action.payload.documentId, ...state }));
            }
        } finally {
            // Set the document upload status to complete

            if(state && state.error){
                yield put(removeDocument(action.payload.documentId));
                yield put(showFailureModal({message: 'You do not have permission to upload documents'}))
            }
            else{
                yield put(updateDocument({
                    documentId: action.payload.documentId,
                    uploadStatus: Sign.DocumentUploadStatus.Complete
                }));
            }
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
                emitter({progress: progress});
            }

            // Upload the document
            const response = axios.post('/api/documents', data, { onUploadProgress })
                .then((response) => {
                    return emitter(END);
                })
                .catch(() => {
                    emitter({status: Sign.DocumentUploadStatus.Failed, error: true})
                    emitter(END);
                });

            const unsubscribe = () => {};
            return unsubscribe;
        });
    }
}

function *finishedSigningDocumentSaga() {
    yield takeEvery(Sign.Actions.Types.FINISHED_SIGNING_DOCUMENT, finishedSigningDocument);

    function *finishedSigningDocument(action: Sign.Actions.FinishedSigningDocument) {
        yield put(showSignConfirmationModal({
            documentId: action.payload.documentId,
            documentSetId: action.payload.documentSetId,
            reject: action.payload.reject,
            isDocumentOwner: action.payload.isDocumentOwner
        }));
    }
}