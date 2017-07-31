import { takeEvery, put, call, select } from 'redux-saga/effects';
import * as Promise from 'bluebird';
import * as PDFJS from "pdfjs-dist";
import { updateDocument } from '../actions';
import { updatePDFPageToStore } from '../actions/pdfStore';


function *getPDFFromStore() {
    yield takeEvery(Sign.Actions.Types.ADD_PDF_TO_STORE, task);

    function *task(action: Sign.Actions.AddPDFToStoreAction) {
        // Create the pdf document proxy
        const docData = new Uint8Array(action.payload.data);
        const pdfDocumentProxy = yield PDFJS.getDocument(docData);
        yield put(updateDocument({
            id: action.payload.id,
            pageCount: pdfDocumentProxy.numPages
        }))
        /*// Get all pages
        const pages = yield Promise.map(
            Array(pdfDocumentProxy.numPages).fill(null),
            (item: any, index: number) => pdfDocumentProxy.getPage(index + 1)
        );*/

        // Add the pdf to the pdf store
        const addPDFAction: Sign.Actions.FinishAddPDFToStoreAction = {
            type: Sign.Actions.Types.FINISH_ADD_PDF_TO_STORE,
            payload: { id: action.payload.id, document: pdfDocumentProxy }
        };

        yield put(addPDFAction);
    }
}

function *getPDFPages() {
    yield takeEvery(Sign.Actions.Types.REQUEST_DOCUMENT_PAGE, task);
    function *task(action: Sign.Actions.RequestDocumentPageAction) {
        const document = yield select((state: Sign.State) => state.pdfStore[action.payload.id]);
        if(!document){
            return;
        }
        const currentStatus = document.pageStatuses[action.payload.index];
        if(!currentStatus || currentStatus === Sign.DocumentReadStatus.NotStarted){
            yield put(updatePDFPageToStore({
                id: action.payload.id,
                index: action.payload.index,
                pageStatus: Sign.DocumentReadStatus.InProgress
            }));
            const page = yield document.document.getPage(action.payload.index + 1);
            yield put(updatePDFPageToStore({
                id: action.payload.id,
                index: action.payload.index,
                page: page,
                pageStatus: Sign.DocumentReadStatus.Complete
            }));

        }

    }

}

export default [getPDFFromStore(), getPDFPages()];