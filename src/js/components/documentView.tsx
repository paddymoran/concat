import * as React from 'react';
import { connect } from 'react-redux';
import PDFViewer from './pdf/viewer';
import { requestRequestedSignatures, requestDocumentSet, endSigningSession } from '../actions';
import { RouteComponentProps, locationShape as Location } from 'react-router';
import { isFinished} from '../utils';

type RouterProps = RouteComponentProps<{documentSetId: string}, {}>

interface DocumentViewProps extends RouterProps{
    params: {
        documentSetId: string;
        documentId: string;
    };
}

interface ConnectedDocumentViewProps extends DocumentViewProps {
    requestDocumentSet: (documentId: string) => void;
    endSigningSession: () => void;
}

interface ConnectedDirtyCheckProps extends DocumentViewProps {
    isFinished: boolean;
}


export class UnconnectedDirtyCheck extends React.PureComponent<ConnectedDirtyCheckProps> {
    static LEAVE_WARNING = 'Are you sure you wish to leave?  Any unsaved changes will be lost.';

    constructor(props: ConnectedDirtyCheckProps) {
        super(props);
        this.routerWillLeave = this.routerWillLeave.bind(this);
        this.navWillLeave = this.navWillLeave.bind(this);
    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.navWillLeave);
        this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.navWillLeave);
    }

    navWillLeave(e: any) {
        if(!this.props.isFinished){
            e.returnValue = UnconnectedDirtyCheck.LEAVE_WARNING;    // Gecko, Trident, Chrome 34+
            return UnconnectedDirtyCheck.LEAVE_WARNING;
        }
        return null;
    }

    routerWillLeave(location: History.Location) {
        // if new route doesn't contain the documentSetId, then we must be navigation away.
        if(!this.props.isFinished && location.pathname.indexOf(this.props.params.documentSetId) === -1){
            return UnconnectedDirtyCheck.LEAVE_WARNING
        }
        return null;
    }

    render() {
        return <div> { this.props.children } </div>
    }
}

export const DirtyCheck = connect<{}, {}, DocumentViewProps>((state: Sign.State, ownProps: DocumentViewProps) => {
    const documentIds = state.documentSets[ownProps.params.documentSetId] && state.documentSets[ownProps.params.documentSetId].documentIds
    return {
        isFinished: isFinished(documentIds, state.documentViewer.documents)
    }
})(UnconnectedDirtyCheck);



export class UnconnectedDocumentView extends React.PureComponent<ConnectedDocumentViewProps>  {


    componentDidMount() {
        this.props.requestDocumentSet(this.props.params.documentSetId);
    }

    componentWillUnmount() {
        this.props.endSigningSession();
    }

    render() {
        return (
               <DirtyCheck {...this.props}>
            <div className="pdf-screen">
                <PDFViewer documentId={this.props.params.documentId} documentSetId={this.props.params.documentSetId} isDocumentOwner={true} />
            </div>
            </DirtyCheck>
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
        return (<DirtyCheck {...this.props}>
            <div className="pdf-screen">
                <PDFViewer documentId={this.props.params.documentId} documentSetId={this.props.params.documentSetId} requestedSignatureInfo={this.props.requestedSignatureInfo} isDocumentOwner={false} />
            </div>
            </DirtyCheck>
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
    requestRequestedSignatures, endSigningSession
})(UnconnectedRequestedDocumentView);
