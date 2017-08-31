import * as React from 'react';
import { IndexRoute, Route } from 'react-router';
import App, { ContainerWithSideBar, Container } from '../components/app';
import { SelectWorkflow, SelectAnnotation } from '../components/selectWorkflow';
import DocumentView, { RequestedDocumentView}  from '../components/documentView';
import { DocumentSetView, UploadDocumentsWithDocumentSetId } from '../components/uploadDocuments';
import SelectRecipients from '../components/selectRecipients';
import Landing from '../components/landing';
import Help from '../components/help';
import { CompletedDocumentSets, PendingDocumentSets, AllDocumentSets } from '../components/documentSets';
import RequestedSignatures from '../components/requestedSignatures';
import NotFound from '../components/notFound';


export default () => {
    return (
        <Route path='/' component={App}>
            <Route path='documents/:documentSetId/:documentId' component={ DocumentView } />
            <Route path='sign/:documentSetId/:documentId' component={ RequestedDocumentView } />
            <Route component={Container}>
                <IndexRoute component={UploadDocumentsWithDocumentSetId} />
                <Route path='faq' component={ Help } />
                <Route path='all' component={ AllDocumentSets } />
                <Route path='to_sign' component={ RequestedSignatures } />
                <Route path='pending' component={ PendingDocumentSets } />
                <Route path='completed' component={ CompletedDocumentSets  } />
                <Route path='documents/:documentSetId' component={ DocumentSetView } />
                <Route path='*' component={ NotFound } />
            </Route>
        </Route>
    );
}
