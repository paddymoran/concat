import * as React from 'react';

interface DocumentSets {

}

export class CompletedDocumentSets extends React.Component<DocumentSets>  {
    render() {
        return (
                <div />
        );
    }
}



export class PendingDocumentSets extends React.Component<DocumentSets>  {
    render() {
        return (
                <div />
        );
    }
}




export class AllDocumentSets extends React.Component<DocumentSets>  {
    render() {
        return (<div>
            <PendingDocumentSets />
            <CompletedDocumentSets />
            </div>
        );
    }
}
