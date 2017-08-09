import * as React from "react";
import { Provider } from 'react-redux';
import routes from './routes';
import { Router } from 'react-router';
import { History } from 'history';
import { DragDropContext } from 'react-dnd';
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