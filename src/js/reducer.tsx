import { combineReducers, Reducer } from 'redux';
import { routerReducer } from 'react-router-redux';

let index = 0;

const documents = (state: Sign.Documents = {filelist: []}, action: Sign.DocumentAction) => {
    let filelist, i;
    switch(action.type) {
        case "ADD_DOCUMENTS":
            return Object.assign({}, state, {filelist: state.filelist.concat(action.payload.map((f: Sign.Document) => {
                f.id = index++;
                f.status = Sign.DocumentUploadStatus.InProgress;
                return f;
            }))});
        case "REMOVE_DOCUMENTS":
            return Object.assign({}, state, {filelist: state.filelist.concat(action.payload.map((f: Sign.Document) => {
                f.id = index++;
                return f;
            }))});
        case "UPDATE_DOCUMENT":
            i = state.filelist.findIndex(file => file.id === action.payload.id);
            filelist = [...state.filelist];
            filelist[i] = Object.assign({}, filelist[i], action.payload);
            return Object.assign({}, state, {filelist: filelist});
         case "REMOVE_DOCUMENT":
            i = state.filelist.findIndex(f => f.id === action.payload.id);
            filelist = [...state.filelist];
            filelist.splice(i, 1);
            return Object.assign({}, state, {filelist: filelist});
    }
    return state;
}

const rootReducer: Reducer<Sign.State> = combineReducers<Sign.State>({
    routing: routerReducer,
    documents
});

export default rootReducer;
