import * as React from 'react';
import { connect } from 'react-redux';
import PDFViewer from './pdf/viewer';
import { requestRequestedSignatures, requestDocumentSet, endSigningSession } from '../actions';




interface DocumentViewProps {
    params: {
        documentSetId: string;
        documentId: string;
    };
}

interface ConnectedDocumentViewProps extends DocumentViewProps {
    requestDocumentSet: (documentId: string) => void
    endSigningSession: () => void
}



export class UnconnectedDocumentView extends React.PureComponent<ConnectedDocumentViewProps>  {

    componentDidMount() {
        this.props.requestDocumentSet(this.props.params.documentSetId)
    }

    componentWillUnmount() {
        this.props.endSigningSession();
    }

    render() {
        return (
               <div>
            <div className="pdf-screen">
                <PDFViewer documentId={this.props.params.documentId} documentSetId={this.props.params.documentSetId} isDocumentOwner={true} />
            </div>
            </div>
        );
    }
}

export const DocumentView = connect<{}, {}, ConnectedDocumentViewProps>((state: Sign.State, ownProps: DocumentViewProps) => {
    return {
    }
}, {
   requestDocumentSet, endSigningSession
})(UnconnectedDocumentView);

export default DocumentView;


interface RequestedSignatureProps extends DocumentViewProps {
    requestRequestedSignatures: () => void;
    requestedSignatures: Sign.RequestedSignatures;
    requestedSignatureInfo?: Sign.RequestedSignatureDocumentInfo;
    endSigningSession: () => void
}



class UnconnectedRequestedDocumentView extends React.PureComponent<RequestedSignatureProps>  {

    componentDidMount() {
        this.props.requestRequestedSignatures()
    }

    componentWillUnmount() {
        this.props.endSigningSession();
    }

    render() {
        // get the request info
        return (
            <div className="pdf-screen">
                <PDFViewer documentId={this.props.params.documentId} documentSetId={this.props.params.documentSetId} requestedSignatureInfo={this.props.requestedSignatureInfo} isDocumentOwner={false} />
            </div>
        );
    }
}

export const RequestedDocumentView = connect<{}, {}, RequestedSignatureProps>((state: Sign.State, ownProps: DocumentViewProps) => {
    const requestedDocumentSet  = state.requestedSignatures.documentSets[ownProps.params.documentSetId];
    const requestedSignatureInfo : Sign.RequestedSignatureDocumentInfo = requestedDocumentSet && requestedDocumentSet[ownProps.params.documentId];
    return {
        requestedSignatureInfo, endSigningSession
    }
}, {
    requestRequestedSignatures
})(UnconnectedRequestedDocumentView);
