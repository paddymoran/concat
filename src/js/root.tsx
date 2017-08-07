import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider, connect } from 'react-redux';
import { Store, createStore } from 'redux';
import configureStore from './configureStore';
import App from './components/app';
import routes from './routes';
import { Router } from 'react-router';
import { History } from 'history';
import { DragSource, DropTarget, DragDropContext } from 'react-dnd';
import * as HTML5Backend from 'react-dnd-html5-backend';

import '../style/style.scss';

interface RootProps {
    history: History,
    store: any
}

class Root extends React.Component<RootProps> {
    render() {
        return (
            <Provider store={this.props.store}>
                <Router history={this.props.history}>
                    { routes() }
                    { this.props.children }
                </Router>
            </Provider>
        );
    }
}

export default DragDropContext(HTML5Backend)(Root);