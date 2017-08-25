import * as React from 'react';
import { connect } from 'react-redux';
import { requestDocumentSets } from '../actions';
import * as moment from 'moment';

interface FileListProps {
    documents: Sign.DocumentData[],
}

interface DocumentSets {
    requestDocumentSets: () => void;
    documents: Sign.Documents,
    documentSets: Sign.DocumentSets
}

class FileList extends React.PureComponent<FileListProps> {

    render() {
        return <table className="table">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>File Name</th>
                    <th>Created Date</th>
                </tr>
            </thead>
            <tbody>
                { this.props.documents.map((document : Sign.Document, i: number) => {
                    return <tr key={i}>
                        <td></td>
                        <td>{ document.filename}</td>
                        <td>{ moment(document.createdAt).format("Do MMM, h:mm:ss a") }</td>
                        </tr>
                }) }
            </tbody>
        </table>
    }

}


class UnconnectedCompletedDocumentSets extends React.PureComponent<DocumentSets>  {
    componentDidMount() {
        this.props.requestDocumentSets()
    }
    render() {

        return (
                <div>

                </div>
        );
    }
}



class UnconnectedPendingDocumentSets extends React.PureComponent<DocumentSets>  {
    componentDidMount() {
        this.props.requestDocumentSets()
    }
    render() {
        const documentSets = this.props.documentSets;
        const documents = Object.keys(documentSets).reduce((acc: any, setId: string) : Sign.DocumentData[] => {
            return [...acc, ...documentSets[setId].documentIds.map((documentId: string) => {
                return this.props.documents[documentId];
            })]
        }, [])
        return (
                <div>
                <FileList documents={documents} />
                </div>
        );
    }
}


export const CompletedDocumentSets = connect((state: Sign.State) => ({
    documentSets: state.documentSets, //.filter(set => !set.status),
    documents: state.documents
}), {
    requestDocumentSets
})(UnconnectedCompletedDocumentSets);

export const PendingDocumentSets = connect((state: Sign.State) => ({
    documentSets: state.documentSets, //.filter(set => !set.status),
    documents: state.documents
}), {
    requestDocumentSets
})(UnconnectedPendingDocumentSets);

export class AllDocumentSets extends React.PureComponent<DocumentSets>  {
    render() {
        return (<div>
            <div className="page-heading"><h1 className="title">Documents</h1></div>
            <PendingDocumentSets />
            <CompletedDocumentSets />
            </div>
        );
    }
}
