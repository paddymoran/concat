import * as React from 'react';
import { connect } from 'react-redux';
import FileDropZone from './fileDropZone';
import DocumentList from './documentList';
import { addDocument, requestDocumentSet, createDocumentSet } from '../actions';
import *  as HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import axios from 'axios';
import { generateUUID } from './uuid';
import  { Link } from 'react-router';
import PDFPage from './pdf/page';

interface UploadDocumentsProps {
    documentIds: string[];
    addDocument: Function;
    createDocumentSet: (payload: Sign.Actions.DocumentSetPayload) => void;
    documentSetId: string;
}

const eachSeries = (arr: Array<any>, iteratorFn: Function) => arr.reduce(
    (p, item) => p.then(() => iteratorFn(item)),
    Promise.resolve()
);

interface DocumentSetViewProps {
    params: {
        documentSetId: string;
    }
}

interface ConnectedDocumentSetProps {
    documentSetId: string;
}

interface ConnectedDocumentSetProps {
    documentSetId: string;
}

interface DocumentSetViewProps {
    params: { documentSetId: string; };
}

interface DocumentSetProps extends ConnectedDocumentSetProps {
    documentSet: Sign.DocumentSet;
    documentIds: string[];
    loaded: boolean;
    requestDocumentSet: (documentSetId: string) => void;
}

export class DocumentSetView extends React.PureComponent<DocumentSetViewProps> {
    render() {
        return <ConnectedDocumentSet documentSetId={this.props.params.documentSetId} />
    }
}

class DocumentSet extends React.PureComponent<DocumentSetProps> {
    componentWillMount() {
        this.props.requestDocumentSet(this.props.documentSetId);
    }

    render() {
        if (!this.props.loaded) {
            return false;
        }

        return (
            <div className="container">
                <div className='page-heading'>
                    <h1 className="title question">{this.props.documentSet.title ? this.props.documentSet.title : 'Unnamed Set'}</h1>
                </div>
                <DocumentList documentIds={this.props.documentIds} />
            </div>
        );
    }
}

const ConnectedDocumentSet = connect(
    (state: Sign.State, ownProps: ConnectedDocumentSetProps) => {
        const documentSet = state.documentSets[ownProps.documentSetId];
        const documentIds = documentSet ? documentSet.documentIds : [];

        return {
            documentIds,
            documentSet,
            loaded: documentSet && documentSet.downloadStatus === Sign.DownloadStatus.Complete
        };
    },
    {
        requestDocumentSet
    }
)(DocumentSet);


class UploadDocuments extends React.Component<UploadDocumentsProps, {}> {
    _fileInput: HTMLInputElement;

    constructor(props: UploadDocumentsProps) {
        super(props);
        this.fileDrop = this.fileDrop.bind(this);
        this.collectFiles = this.collectFiles.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    componentWillMount() {
        this.props.createDocumentSet({ documentSetId: this.props.documentSetId });
    }

    fileDrop(files: File[]) {
        files.map(file => generateUUID().then(uuid => this.props.addDocument(uuid, file.name, file)));
    }

    collectFiles(event: React.ChangeEvent<HTMLInputElement>) {
       this.fileDrop([].filter.call(event.target.files, (f: File) => f.type === 'application/pdf'));
    }

    onClick() {
        if (this._fileInput) {
            this._fileInput.value = null;
            this._fileInput.click();
        }
    }

    render() {
        return (
            <FileDropZone onDrop={this.fileDrop}>
                <div className="container">
                <div className='page-heading'>
                <h1 className="title question">Upload Documents</h1>
                <div className="sub-title step-count">Step 2</div>
                </div>

                <div className="explanation fake-drop-zone" onClick={this.onClick}>
                    <span className="drag-instruction">Drag PDFs here, or click to select</span>
                    <span className="drop-instruction">DROP HERE</span>
                        <input type="file" multiple name="files" style={{display: 'none'}} ref={(el) => this._fileInput = el} onChange={this.collectFiles}/>
                    </div>


                    { this.props.documentIds && <DocumentList documentIds={this.props.documentIds} /> }

                    { !!this.props.documentIds && this.props.documentIds.length && <div className="button-bar">
                        <Link to={`/documents/${this.props.documentIds[0] ? this.props.documentIds[0]: 'no-id'}`} className={'btn btn-primary ' + (this.props.documentIds.length === 0 ? 'disabled' : '')}>Sign Documents</Link>
                    </div> }
                </div>
            </FileDropZone>
        );
    }
}

const DNDUploadDocuments = DragDropContext(HTML5Backend)(UploadDocuments)

export default connect(
    (state: Sign.State, ownProps: any) => {
        const { documentSetId } = ownProps.params;
        return {
            documentsIds: state.documentSets[documentSetId] ? state.documentSets[documentSetId].documentIds : null,
            documentSetId
        };
    },
    {
        addDocument,
        createDocumentSet
    }
)(DNDUploadDocuments);