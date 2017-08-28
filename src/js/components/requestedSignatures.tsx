import * as React from 'react';
import { connect } from 'react-redux';
import { requestRequestedSignatures } from '../actions';
import * as moment from 'moment';
import { stringToDateTime } from '../utils';
import { Link } from 'react-router';


interface RequestedSignatureProps {
    requestRequestedSignatures: () => void;
    requestedSignatures: Sign.RequestedSignatures;
}

interface RequestedSignatureDocumentSetProps {
    documentSetId: string;
    requestDocumentSet: {
        [documentId: string]: {

        }
    }
}


interface ConnectedRequestedSignatureDocumentSetProps extends RequestedSignatureDocumentSetProps {
    documents: {
        [documentId: string]: Sign.Document
    },
    documentSet: Sign.DocumentSet
}

class RequestedSignatureDocumentSet extends React.PureComponent<ConnectedRequestedSignatureDocumentSetProps>  {
    render() {
        const inviter = this.props.documentSet.owner.name;
        const documentSetLabel = stringToDateTime(this.props.documentSet.createdAt);

        return (<div className="request-signature">
                <div className="request-signature-title"><span className="inviter">{ inviter }</span> has requested that you sign the following: </div>
                { Object.keys(this.props.requestDocumentSet).map((documentId: string, index: number) => {
                    const document : Sign.Document = this.props.documents[documentId]
                    const url = `/sign/${this.props.documentSetId}/${documentId}`;
                    return <div key={index} className="document-line"><Link to={url}><i className="fa fa-file-pdf-o" /> { document.filename }</Link></div>
                }) }
                </div>
        );
    }
}

const ConnectedRequestedSignatureDocumentSet = connect((state: Sign.State, ownProps: RequestedSignatureDocumentSetProps) => ({
    documentSet: state.documentSets[ownProps.documentSetId],
    documents: state.documents
}), {

})(RequestedSignatureDocumentSet);


class RequestedSignatures extends React.PureComponent<RequestedSignatureProps>  {
    componentDidMount() {
        this.props.requestRequestedSignatures()
    }
    render() {
        const keys : string[] = Object.keys(this.props.requestedSignatures.documentSets);
        if(!keys.length){
            return false;
        }
        return (<div>
                     <div className="page-heading"><h1 className="title">Documents To Sign</h1></div>
                     { keys.map((documentSetId: string, index: number) => {
                            return <ConnectedRequestedSignatureDocumentSet key={index} documentSetId={documentSetId} requestDocumentSet={this.props.requestedSignatures.documentSets[documentSetId]} />
                     }) }
                </div>
        );
    }
}

const ConnectedRequestedSignature = connect((state: Sign.State) => ({
    requestedSignatures: state.requestedSignatures
}), {
    requestRequestedSignatures
})(RequestedSignatures);




export default ConnectedRequestedSignature;