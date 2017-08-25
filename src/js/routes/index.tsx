import * as React from 'react';
import { IndexRoute, Route } from 'react-router';
import App, { ContainerWithSideBar } from '../components/app';
import { SelectWorkflow, SelectAnnotation } from '../components/selectWorkflow';
import DocumentView from '../components/documentView';
import { DocumentSetView, UploadDocuments, UploadDocumentsOthers } from '../components/uploadDocuments';
import SelectRecipients from '../components/selectRecipients';
import Landing from '../components/landing';
import Help from '../components/help';
import { CompletedDocumentSets, PendingDocumentSets, AllDocumentSets } from '../components/documentSets';
import NotFound from '../components/notFound';


export default () => {
    return (
        <Route path='/' component={App}>
            <Route path='documents/:documentSetId/:documentId' component={ DocumentView } />
            <Route component={ContainerWithSideBar}>
                <IndexRoute component={Landing} />
                <Route path="sign" component={SelectWorkflow} />
                <Route path='self_sign/:documentSetId' component={ UploadDocuments } />
                <Route path='others_sign/:documentSetId' component={ UploadDocumentsOthers } />
                <Route path='others_sign/select_recipients/:documentSetId' component={ SelectRecipients } />
                <Route path='others_sign/select_annotation/:documentSetId' component={ SelectAnnotation} />
                <Route path='help' component={ Help } />
                <Route path='all' component={ AllDocumentSets } />
                <Route path='pending' component={ PendingDocumentSets } />
                <Route path='completed' component={ CompletedDocumentSets  } />
                <Route path='documents/:documentSetId' component={ DocumentSetView } />
                <Route path='*' component={ NotFound } />
            </Route>
        </Route>
    );
}
