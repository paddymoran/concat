import * as React from 'react';
import { IndexRoute, Route, Router, RouteComponent } from 'react-router';
import App from './app';
import SelectWorkflow from './SelectWorkflow';
import DocumentTray from './documentTray';
import DocumentView from './documentView';
import UploadDocuments from './uploadDocuments';

export default (component: RouteComponent) => {
    return (
        <Route path='/' component={ component }>
            <IndexRoute component={ SelectWorkflow } />
            <Route path='selfsign' component={ UploadDocuments } />
            <Route path='documents/:documentId' component={ DocumentView } />
        </Route>
    );
}
