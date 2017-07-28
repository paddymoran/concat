import * as React from 'react';
import { IndexRoute, Route, Router, RouteComponent } from 'react-router';
import App from '../components/app';
import SelectWorkflow from '../components/selectWorkflow';
import DocumentView from '../components/documentView';
import UploadDocuments from '../components/uploadDocuments';

export default () => {
    return (
        <Route path='/' component={App}>
            <IndexRoute component={SelectWorkflow} />

            <Route path='selfsign' component={UploadDocuments} />
            <Route path='documents/:documentId' component={DocumentView} />
        </Route>
    );
}
