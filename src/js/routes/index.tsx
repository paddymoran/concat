import * as React from 'react';
import { IndexRoute, Route } from 'react-router';
import App from '../components/app';
import SelectWorkflow from '../components/selectWorkflow';
import DocumentView from '../components/documentView';
import { DocumentSetView, UploadDocuments, UploadDocumentsOthers } from '../components/uploadDocuments';
import SelectRecipients from '../components/selectRecipients';

export default () => {
    return (
        <Route path='/' component={App}>
            <IndexRoute component={SelectWorkflow} />

            <Route path='self_sign/:documentSetId' component={ UploadDocuments } />
            <Route path='others_sign/:documentSetId' component={ UploadDocumentsOthers } />
            <Route path='select_recipients/:documentSetId' component={ SelectRecipients } />
            <Route path='documents/:documentSetId' component={ DocumentSetView } />
            <Route path='documents/:documentSetId/:documentId' component={ DocumentView } />
        </Route>
    );
}
