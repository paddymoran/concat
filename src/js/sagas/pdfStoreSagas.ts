import { select, takeEvery, put, call } from 'redux-saga/effects';
import * as Promise from 'bluebird';

function *getPDFFromStore() {
    yield takeEvery(Sign.Actions.Types.ADD_PDF_TO_STORE, task);

    function *task(action: Sign.Actions.AddPDFToStoreAction) {
        // Create the pdf document proxy
        const docData = new Uint8Array(action.payload.data);
        const pdfDocumentProxy = yield PDFJS.getDocument(docData);

        // Get all pages
        const pages = yield Promise.map(
            Array(pdfDocumentProxy.numPages).fill(null),
            (item: any, index: number) => pdfDocumentProxy.getPage(index + 1)
        );

        // Add the pdf to the pdf store
        const addPDFAction: Sign.Actions.FinishAddPDFToStoreAction = {
            type: Sign.Actions.Types.FINISH_ADD_PDF_TO_STORE,
            payload: { id: action.payload.id, document: pdfDocumentProxy, pages }
        };

        yield put(addPDFAction);
    }
}

export default [getPDFFromStore()];