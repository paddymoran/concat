import { select, takeEvery, put, call } from 'redux-saga/effects';
import * as Promise from 'bluebird';

function *getPDFFromStore() {
    yield takeEvery(Sign.Actions.Types.GET_PAGE_FROM_PDF_STORE, task);

    function *task(action: Sign.Actions.IGetPageFromPDFStoreAction) {
        const { pdf } = yield select((state: Sign.State) => ({ pdf: state.pdfStore[action.payload.docId] }));
        
        if (!pdf) {
            const { doc } = yield select((state: Sign.State) => ({ doc: state.documentSet.documents.find(doc => doc.id === action.payload.docId) }));
            
            // Check the document has finished uploading
            if (doc.readStatus === Sign.DocumentReadStatus.Complete) {
                // Create the pdf document proxy
                const docData = new Uint8Array(doc.data);
                const pdfDocumentProxy = yield PDFJS.getDocument(docData);

                // Get all pages
                const pages = yield Promise.map(
                    Array(pdfDocumentProxy.numPages).fill(null),
                    (item: any, index: number) => pdfDocumentProxy.getPage(index + 1)
                );

                // Add the pdf to the pdf store
                const addPDFAction: Sign.Actions.IAddPDFToStoreAction = {
                    type: Sign.Actions.Types.ADD_PDF_TO_STORE,
                    payload: { id: action.payload.docId, document: pdfDocumentProxy, pages }
                };

                yield put(addPDFAction);
            }
        }
    }
}

export default [getPDFFromStore()];