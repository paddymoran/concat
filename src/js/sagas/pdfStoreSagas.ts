import { select, takeEvery, put, call } from 'redux-saga/effects';
import * as Promise from 'bluebird';

function *getPDFFromStore() {
    yield takeEvery(Sign.Actions.Types.UPDATE_DOCUMENT, task);

    function *task(action: Sign.Actions.UpdateDocument) {
        const { pdf } = yield select((state: Sign.State) => ({ pdf: state.pdfStore[action.payload.id] }));
        
        if (!pdf) {
            const { doc } = yield select((state: Sign.State) => ({ doc: state.documentSet.documents.find(doc => doc.id === action.payload.id) }));
            
            // Check the document has finished uploading
            if (doc && doc.readStatus === Sign.DocumentReadStatus.Complete) {
                // Create the pdf document proxy
                const docData = new Uint8Array(doc.data);
                const pdfDocumentProxy = yield PDFJS.getDocument(docData);

                // Get all pages
                const pages = yield Promise.map(
                    Array(pdfDocumentProxy.numPages).fill(null),
                    (item: any, index: number) => pdfDocumentProxy.getPage(index + 1)
                );

                // Add the pdf to the pdf store
                const addPDFAction: Sign.Actions.AddPDFToStoreAction = {
                    type: Sign.Actions.Types.ADD_PDF_TO_STORE,
                    payload: { id: action.payload.id, document: pdfDocumentProxy, pages }
                };

                yield put(addPDFAction);
            }
        }
    }
}

export default [getPDFFromStore()];