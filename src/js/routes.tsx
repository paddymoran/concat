import * as React from 'react';
import { IndexRoute, Route, Router } from 'react-router';
import App from './app';
import DocumentTray from './documentTray';
import DocumentView from './documentView';

export default (store, component) => {
    return (
        <Route path='/' component={ component }>
            <IndexRoute component={ DocumentTray } />
            <Route path='test' component={ DocumentTray } />
            <Route path='documents/:documentId' component={ DocumentView } />
        </Route>
    );
}
