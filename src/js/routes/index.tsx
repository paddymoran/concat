import * as React from 'react';
import { IndexRoute, Route } from 'react-router';
import App, { ContainerWithStatusBar } from '../components/app';
import DocumentView, { RequestedDocumentView }  from '../components/documentView';
import { UploadDocumentsWithDocumentSetId } from '../components/uploadDocuments';
import { CompletedDocumentSets, PendingDocumentSets, AllDocumentSets, DocumentSet } from '../components/documentSets';
import RequestedSignatures from '../components/requestedSignatures';
import NotFound from '../components/notFound';
import Documents from '../components/documents';
import Verify from '../components/verify';


export default () => {
    return (
        <Route path='/' component={App}>
            <Route path='documents/:documentSetId/:documentId' component={ DocumentView } />
            <Route path='sign/:documentSetId/:documentId' component={ RequestedDocumentView } />
            <Route component={ContainerWithStatusBar}>
                <IndexRoute component={UploadDocumentsWithDocumentSetId} />
                <Route path='verify' component={ Verify } />
                <Route component={Documents}>
                    <Route path='all' component={ AllDocumentSets } />
                    <Route path='to_sign' component={ RequestedSignatures } />
                    <Route path='pending' component={ PendingDocumentSets } />
                    <Route path='completed' component={ CompletedDocumentSets  } />
                    <Route path='documents/:documentSetId' component={ DocumentSet } />
                </Route>
                <Route path='*' component={ NotFound } />
            </Route>
        </Route>
    );
}
