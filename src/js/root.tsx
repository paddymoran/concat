import "babel-polyfill";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider, connect } from 'react-redux';
import { Store, createStore } from 'redux';
import configureStore from './configureStore';
import { addDocuments, updateDocument, submitDocuments, removeDocument, updateForm } from './actions';
import App from './app';
import routes from './routes';
import { Router } from 'react-router';
import { Document } from './definitions';

import '../style/style.scss';

const ConnectedApp = connect(state => ({documents: state.documents, form: state.form}), {
    addDocuments: addDocuments,
    updateDocument: updateDocument,
    submitDocuments: submitDocuments,
    removeDocument: removeDocument,
    updateForm: updateForm
})(App);

interface RootProps {
    history: any,
    store: any
}

export default class Root extends React.Component<RootProps, {}> {
    render() {
        return (
            <Provider store={this.props.store}>
                <Router history={this.props.history}>
                    { routes(ConnectedApp) }
                    { this.props.children }
                </Router>
            </Provider>
        );
    }
}