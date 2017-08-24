import * as React from 'react';
import { connect } from 'react-redux';
import { requestDocumentSets } from '../actions';

interface DocumentSets {
    requestDocumentSets: () => void;
}

class UnconnectedCompletedDocumentSets extends React.Component<DocumentSets>  {
    componentDidMount() {
        this.props.requestDocumentSets()
    }
    render() {
        return (
                <div />
        );
    }
}



class UnconnectedPendingDocumentSets extends React.Component<DocumentSets>  {
    componentDidMount() {
        this.props.requestDocumentSets()
    }
    render() {
        return (
                <div />
        );
    }
}


export const CompletedDocumentSets = connect(() => ({

}), {
    requestDocumentSets
})(UnconnectedCompletedDocumentSets);

export const PendingDocumentSets = connect(() => ({

}), {
    requestDocumentSets
})(UnconnectedPendingDocumentSets);

export class AllDocumentSets extends React.Component<DocumentSets>  {
    render() {
        return (<div>
            <div className="page-heading"><h1 className="title">Documents</h1></div>
            <PendingDocumentSets />
            <CompletedDocumentSets />
            </div>
        );
    }
}
