import { combineReducers, Reducer } from 'redux';
import { routerReducer } from 'react-router-redux';

let index = 0;

const documentSet = (state: Sign.DocumentSet = {documents: []}, action: Sign.DocumentAction) => {
    let setId, documents, i;
    switch(action.type) {
        case "SET_DOCUMENT_SET_ID":
            return Object.assign({}, state, {id: action.payload});
        case "ADD_DOCUMENTS":
            return Object.assign({}, state, {documents: state.documents.concat(action.payload.map((f: Sign.Document) => {
                f.id = index++;
                f.status = Sign.DocumentUploadStatus.NotStarted;
                return f;
            }))});
        case "REMOVE_DOCUMENTS":
            return Object.assign({}, state, {documents: state.documents.concat(action.payload.map((f: Sign.Document) => {
                f.id = index++;
                return f;
            }))});
        case "UPDATE_DOCUMENT":
            i = state.documents.findIndex(doc => doc.id === action.payload.id);
            documents = [...state.documents];
            documents[i] = Object.assign({}, documents[i], action.payload);
            return Object.assign({}, state, {documents});
         case "REMOVE_DOCUMENT":
            i = state.documents.findIndex(doc => doc.id === action.payload.id);
            documents = [...state.documents];
            documents.splice(i, 1);
            return Object.assign({}, state, {documents});
    }
    return state;
}

const rootReducer: Reducer<Sign.State> = combineReducers<Sign.State>({
    routing: routerReducer,
    documentSet
});

export default rootReducer;
