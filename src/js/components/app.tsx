import * as React from "react";
import Header from './header';
import DocumentView from './documentView';
import DragContextDocumentHandler from './dragContextDocumentHandler';

interface AppProps {
    documents: any;
    form: any;
    updateDocument: Function;
    removeDocument: Function;
}

export default class App extends React.Component<AppProps, {}> {
    render() {
        return (
            <div>
                <Header />
                { this.props.children }
            </div>
        );
    }
}