import { combineReducers, Reducer } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { reducer as form } from 'redux-form'
import pdfStore from './pdfStore';
import documents from './documents';
import documentSets from './documentSets';
import documentSetsStatus from './documentSetsStatus';
import documentViewer from './documentViewer';
import signatures from './signatures';
import modals from './modals';
import dimensions from './dimensions';
import overlayDefaults from './overlayDefaults';
import requestedSignatures from './requestedSignatures';
import uploadDocuments from './uploadDocuments';
import toSignPage from './toSignPage';
import contacts from './contacts';
import usage from './usage';
import verifications from './verifications';
import user from './user';
import userMeta from './userMeta';
import tour from './tour';

const appReducer: Reducer<Sign.State> = combineReducers<Sign.State>({
    routing,
    documentSets,
    documentSetsStatus,
    documents,
    pdfStore,
    modals,
    documentViewer,
    signatures,
    dimensions,
    requestedSignatures,
    form,
    uploadDocuments,
    overlayDefaults,
    toSignPage,
    contacts,
    usage,
    verifications,
    user,
    userMeta,
    tour
});

const rootReducer = (state : Sign.State, action: any) => {
  if (action.type === Sign.Actions.Types.RESET_STATE) {
        return appReducer(undefined, action);
  }
  return appReducer(state, action)
}


export default rootReducer;
