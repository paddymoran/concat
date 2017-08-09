import { combineReducers, Reducer } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import pdfStore from './pdfStore';
import documents from './documents';
import documentSets from './documentSets';
import documentViewer from './documentViewer';
import signatures from './signatures';

const modals = (state: Sign.Modals = {
    results: {}

}, action: any) => {
    switch (action.type) {
        case Sign.Actions.Types.SHOW_SIGNATURE_SELECTION:
            return Object.assign({}, state, {showing: 'selectSignature'});
<<<<<<< HEAD
        case Sign.Actions.Types.SHOW_RESULTS:
            return Object.assign({}, state, {showing: 'results', results: action.payload});
=======

        case Sign.Actions.Types.SHOW_INITIAL_SELECTION_MODAL:
            return { ...state, showing: 'selectInitial' };

>>>>>>> ca37707bd98229f6176d3c8596ce2316452ae4ed
        case Sign.Actions.Types.CLOSE_SHOWING_MODAL:
            return { ...state, showing: undefined };

        default:
            return state;
    }
}

const rootReducer: Reducer<Sign.State> = combineReducers<Sign.State>({
    routing,
    documentSets,
    documents,
    pdfStore,
    modals,
    documentViewer,
    signatures,
});

export default rootReducer;
