import * as React from 'react';
import { IndexRoute, Route, Router, RouteComponent } from 'react-router';
import App from '../components/app';
import SelectWorkflow from '../components/selectWorkflow';
import DocumentView from '../components/documentView';
import UploadDocuments, { DocumentSetView } from '../components/uploadDocuments';

import { generateUploadDocumentsDocumentSetId } from '../actions';

export default () => {
    return (
        <Route path='/' component={App}>
            <IndexRoute component={SelectWorkflow} />

            <Route path='selfsign/:documentSetId' component={UploadDocuments} />
            <Route path='documents/:documentSetId' component={DocumentSetView} />
            <Route path='documents/:documentSetId/:documentId' component={DocumentView} />
        </Route>
    );
}
