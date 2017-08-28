import { takeEvery, put, call, select } from 'redux-saga/effects';
import * as Promise from 'bluebird';
import * as PDFJS  from "pdfjs-dist/webpack";

import { updateDocument } from '../actions';
import { updatePDFPageToStore } from '../actions/pdfStore';
import { delay } from 'redux-saga'


function *getPDFFromStore() {
    yield takeEvery(Sign.Actions.Types.ADD_PDF_TO_STORE, task);

    function *task(action: Sign.Actions.AddPDFToStoreAction) {
        // Create the pdf document proxy
        const docData = new Uint8Array(action.payload.data);
        const pdfDocumentProxy = yield PDFJS.getDocument(docData);
        // Add the pdf to the pdf store

        const pages = yield Promise.all(Array(pdfDocumentProxy.numPages).fill(1).map((p, i) => {
            return pdfDocumentProxy.getPage(i+1)
        }));

        yield put(updateDocument({
            documentId: action.payload.id,
            pageCount: pdfDocumentProxy.numPages,
            pageViewports: pages.map((p : PDFPageProxy) => ({width: p.view[2], height: p.view[3]}))
        }));

        const pageStatuses =  Array(pdfDocumentProxy.numPages).fill(1).map(() => Sign.DocumentReadStatus.Complete);
        const addPDFAction: Sign.Actions.FinishAddPDFToStoreAction = {
            type: Sign.Actions.Types.FINISH_ADD_PDF_TO_STORE,
            payload: { id: action.payload.id, document: pdfDocumentProxy, pages, pageStatuses }
        };

        yield put(addPDFAction);
    }
}


function *getPage(action: Sign.Actions.RequestDocumentPageAction) {
    yield call(delay, 0);
    const pdfStore = yield select((state: Sign.State) => state.pdfStore[action.payload.id]);
    if(!pdfStore){
        return;
    }
    const status = pdfStore.pageStatuses[action.payload.index];
    if(status !== Sign.DocumentReadStatus.NotStarted){
        return;
    }
    yield put(updatePDFPageToStore({
        id: action.payload.id,
        index: action.payload.index,
        pageStatus: Sign.DocumentReadStatus.InProgress
    }));

    const page = yield call(pdfStore.document.getPage.bind(pdfStore.document), action.payload.index + 1);

 
    yield put(updatePDFPageToStore({
        id: action.payload.id,
        index: action.payload.index,
        page: page,
        pageStatus: Sign.DocumentReadStatus.Complete
    }));

}

function *getPDFPages() {
    yield takeEvery(Sign.Actions.Types.REQUEST_DOCUMENT_PAGE, getPage);
}


export default [getPDFFromStore(), getPDFPages()];