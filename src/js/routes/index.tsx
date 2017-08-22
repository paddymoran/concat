import * as React from 'react';
import { IndexRoute, Route } from 'react-router';
import App from '../components/app';
import SelectWorkflow from '../components/selectWorkflow';
import DocumentView from '../components/documentView';
import { DocumentSetView, UploadDocuments, UploadDocumentsOthers  } from '../components/uploadDocuments';

export default () => {
    return (
        <Route path='/' component={App}>
            <IndexRoute component={SelectWorkflow} />

            <Route path='self_sign/:documentSetId' component={ UploadDocuments } />
            <Route path='others_sign/:documentSetId' component={ UploadDocumentsOthers } />
            <Route path='documents/:documentSetId' component={ DocumentSetView } />
            <Route path='documents/:documentSetId/:documentId' component={ DocumentView } />
        </Route>
    );
}
