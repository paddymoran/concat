import * as React from 'react';
import { IndexRoute, Route, Router, RouteComponent } from 'react-router';
import App from '../components/app';
import SelectWorkflow from '../components/selectWorkflow';
import DocumentView from '../components/documentView';
import UploadDocuments from '../components/uploadDocuments';
import DocumentRenderer from '../components/documentRenderer';

export default (component: RouteComponent) => {
    return (
        <Route path='/' component={component}>
            <IndexRoute component={SelectWorkflow} />

            <Route component={DocumentRenderer}>
                <Route path='selfsign' component={UploadDocuments} />
                <Route path='documents/:documentId' component={DocumentView} />
            </Route>
        </Route>
    );
}
