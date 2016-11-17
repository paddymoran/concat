import * as React from "react";
import Header from './Header';
import Footer from './Footer';
import DocumentView from './documentView';
import DragContextDocumentHandlerConnected from './dragContextDocumentHandlerConnected';

interface SignDocumentProps {
    documents: any;
    form: any;
    updateDocument: Function;
    removeDocument: Function;
}

export default class SignDocument extends React.Component<SignDocumentProps, {}> {
    render() {
        const doc = this.props.documents.filelist[0];

        return (
            <DocumentView
                document={doc}
                key={doc.id}
                index={doc.id}
                updateDocument={this.props.updateDocument}
                removeDocument={() => this.props.removeDocument({id: doc.id})} />
        );
    }
}