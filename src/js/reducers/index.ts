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

const documentSet = (state: Sign.DocumentSet = {documents: []}, action: Sign.DocumentAction) => {
    let setId, documents, i;
    switch(action.type) {
        case Sign.Actions.Types.SET_DOCUMENT_SET_ID:
            return Object.assign({}, state, {id: action.payload});

        case Sign.Actions.Types.ADD_DOCUMENT:
            const newDoc = {
                ...action.payload,
                uploadStatus: Sign.DocumentUploadStatus.NotStarted,
                readStatus: Sign.DocumentReadStatus.NotStarted
            };
            return Object.assign({}, state, { documents: state.documents.concat(newDoc) });

        case Sign.Actions.Types.REQUEST_DOCUMENT:
            const requestDoc = {
                ...action.payload,
                uploadStatus: Sign.DocumentUploadStatus.Complete,
                readStatus: Sign.DocumentReadStatus.NotStarted
            };
            return Object.assign({}, state, { documents: state.documents.concat(requestDoc) });

        case Sign.Actions.Types.UPDATE_DOCUMENT:
            i = state.documents.findIndex(doc => doc.id === action.payload.id);
            documents = [...state.documents];
            documents[i] = Object.assign({}, documents[i], action.payload);
            return Object.assign({}, state, {documents});

         case Sign.Actions.Types.REMOVE_DOCUMENT:
            i = state.documents.findIndex(doc => doc.id === action.payload);
            documents = [...state.documents];
            documents.splice(i, 1);
            return Object.assign({}, state, {documents});
    }
    return state;
}

const rootReducer: Reducer<Sign.State> = combineReducers<Sign.State>({
    routing: routerReducer,
    documentSet,
    pdfStore: pdfStoreReducer,
    modals: modals
});

export default rootReducer;
