import * as React from 'react';
import { connect } from 'react-redux';
import PDFViewer from './pdf/viewer';
import { requestRequestedSignatures } from '../actions';

interface DocumentViewProps {
    params: {
        documentSetId: string;
        documentId: string;
    };
}

export default class DocumentView extends React.Component<DocumentViewProps>  {
    render() {
        return (
            <div className="pdf-screen">
                <PDFViewer documentId={this.props.params.documentId} documentSetId={this.props.params.documentSetId} />
            </div>
        );
    }
}


interface RequestedSignatureProps extends DocumentViewProps {
    requestRequestedSignatures: () => void;
    requestedSignatures: Sign.RequestedSignatures;
    requestedSignatureInfo?: Sign.RequestedSignatureDocumentInfo;
}



class UnconnectedRequestedDocumentView extends React.Component<RequestedSignatureProps>  {
    componentDidMount() {
        this.props.requestRequestedSignatures()
    }
    render() {
        // get the request info
        return (
            <div className="pdf-screen">
                <PDFViewer documentId={this.props.params.documentId} documentSetId={this.props.params.documentSetId} requestedSignatureInfo={this.props.requestedSignatureInfo}/>
            </div>
        );
    }
}

export const RequestedDocumentView = connect<{}, {}, RequestedSignatureProps>((state: Sign.State, ownProps: DocumentViewProps) => {
    const requestedDocumentSet  = state.requestedSignatures.documentSets[ownProps.params.documentSetId];
    const requestedSignatureInfo : Sign.RequestedSignatureDocumentInfo = requestedDocumentSet && requestedDocumentSet[ownProps.params.documentId];
    return {
        requestedSignatureInfo
    }
}, {
    requestRequestedSignatures
})(UnconnectedRequestedDocumentView);
