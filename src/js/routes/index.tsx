import * as React from 'react';
import { IndexRoute, Route } from 'react-router';
import App, { ContainerWithSideBar } from '../components/app';
import { SelectWorkflow, SelectAnnotation } from '../components/selectWorkflow';
import DocumentView from '../components/documentView';
import { DocumentSetView, UploadDocuments, UploadDocumentsOthers } from '../components/uploadDocuments';
import SelectRecipients from '../components/selectRecipients';

export default () => {
    return (
        <Route path='/' component={App}>
            <Route component={ContainerWithSideBar}>
                <IndexRoute component={SelectWorkflow} />
                <Route path='self_sign/:documentSetId' component={ UploadDocuments } />
                <Route path='others_sign/:documentSetId' component={ UploadDocumentsOthers } />
                <Route path='others_sign/select_recipients/:documentSetId' component={ SelectRecipients } />
                <Route path='others_sign/select_annotation/:documentSetId' component={ SelectAnnotation} />
            </Route>
            <Route path='documents/:documentSetId' component={ DocumentSetView } />
            <Route path='documents/:documentSetId/:documentId' component={ DocumentView } />
        </Route>
    );
}
