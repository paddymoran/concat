import { combineReducers, Reducer } from 'redux';
import { routerReducer } from 'react-router-redux';

import pdfStoreReducer from './pdfStore';
const modals = (state: Sign.Modals = {}, action: any) => {
    switch (action.type) {
        case Sign.Actions.Types.SHOW_SIGNATURE_SELECTION:
            return Object.assign({}, state, {showing: 'selectSignature'});
        case Sign.Actions.Types.HIDE_SIGNATURE_SELECTION:
            return Object.assign({}, state, {showing: null});
    }
    return state;
}

const documentSets = (state: Sign.DocumentSets = {}, action: Sign.DocumentAction) => {
    let setId, documents, i;
    switch(action.type) {
        case Sign.Actions.Types.CREATE_DOCUMENT_SET:
            {
                const { documentSetId, ...rest } = action.payload;

                const newDocumentSet = {
                    ...rest,
                    documentIds: [],
                    downloadStatus: Sign.DownloadStatus.NotStarted
                };

                return {
                    ...state,
                    [action.payload.documentSetId]: newDocumentSet
                };
            }

        case Sign.Actions.Types.UPDATE_DOCUMENT_SET:
            {
                const { documentSetId, ...rest } = action.payload;

                return {
                    ...state,
                    [documentSetId]: { ...state[documentSetId], ...rest }
                };
            }


        case Sign.Actions.Types.ADD_DOCUMENT:
            // dedupe
            const documentIds = [...state[action.payload.documentSetId].documentIds, action.payload.documentId];

            return {
                ...state,
                [action.payload.documentSetId]: { ...state[action.payload.documentSetId], documentIds }
            };

         case Sign.Actions.Types.REMOVE_DOCUMENT:
            i = state[action.payload.documentSetId].documentIds.findIndex(doc => doc === action.payload.documentId);

            if (i > -1) {
                return {
                    ...state,
                    [action.payload.documentSetId]: {
                        ...state[action.payload.documentSetId],
                        documents: state[action.payload.documentSetId].documentIds.splice(i, 1)
                    }
                };
            }
            return state;
    }
    return state;
}

function documents(state: Sign.Documents = {}, action: any) {
    switch (action.type) {
        case Sign.Actions.Types.ADD_DOCUMENT:
            const { documentSetId, documentId, ...rest } = action.payload;
            const newDoc = {
                ...rest,
                uploadStatus: Sign.DocumentUploadStatus.NotStarted,
                readStatus: Sign.DocumentReadStatus.NotStarted
            };

            return { ...state, [documentId]: newDoc };

        case Sign.Actions.Types.UPDATE_DOCUMENT:
            {
                const { documentSetId, documentId, ...rest } = action.payload;
                return { ...state, [documentId]: { ...state[documentId], ...rest } };
            }

        case Sign.Actions.Types.REQUEST_DOCUMENT:
            {
                const  { documentSetId, documentId, ...rest } = action.payload;
                const requestDoc = {
                    ...rest,
                    uploadStatus: Sign.DocumentUploadStatus.Complete,
                    readStatus: Sign.DocumentReadStatus.NotStarted
                };
                return { ...state, [documentId]: { ...state[documentId], ...requestDoc } };
            }

        case Sign.Actions.Types.REMOVE_DOCUMENT:
            return { ...state, [action.payload.documentId]: undefined };
        
        default:
            return state;
    }
}

const rootReducer: Reducer<Sign.State> = combineReducers<Sign.State>({
    routing: routerReducer,
    documentSets,
    documents,
    pdfStore: pdfStoreReducer,
    modals: modals
});

export default rootReducer;
