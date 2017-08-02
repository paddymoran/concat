import { combineReducers, Reducer } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import pdfStore from './pdfStore';
import documents from './documents';
import documentSets from './documentSets';
import documentViewer from './documentViewer';

const modals = (state: Sign.Modals = {}, action: any) => {
    switch (action.type) {
        case Sign.Actions.Types.SHOW_SIGNATURE_SELECTION:
            return Object.assign({}, state, {showing: 'selectSignature'});
        case Sign.Actions.Types.HIDE_SIGNATURE_SELECTION:
            return Object.assign({}, state, {showing: null});
    }
    return state;
}

const rootReducer: Reducer<Sign.State> = combineReducers<Sign.State>({
    routing,
    documentSets,
    documents,
    pdfStore,
    modals,
    documentViewer,
});

export default rootReducer;
