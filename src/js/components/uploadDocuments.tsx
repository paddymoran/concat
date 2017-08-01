import * as React from 'react';
import { connect } from 'react-redux';
import FileDropZone from './fileDropZone';
import DocumentList from './documentList';
import { addDocument, removeDocument, updateDocument, requestDocumentSet } from '../actions';
import *  as HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import axios from 'axios';
import { generateUUID } from './uuid';
import  { Link } from 'react-router';
import { addPDFToStore } from '../actions/pdfStore';
import PDFPage from './pdf/page';

interface UploadDocumentsProps {
    documentSet: Sign.DocumentSet;
    addDocument: Function;
    removeDocument: (id: number) => void;
    updateDocument: Function;
    addPDFToStore: (payload: Sign.Actions.AddPDFToStoreActionPayload) => void;
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

interface DocumentSetProps {
    documentSetId: string;
    documentIds: string[];
    loaded: boolean;
    requestDocumentSet: (documentSetId: string) => void;
}

export class DocumentSetView extends React.PureComponent<DocumentSetViewProps> {
    render() {
        return <DocumentSet documentSetId={this.props.params.documentSetId} />
    }
}

@connect(
    (state: Sign.State, ownProps: ConnectedDocumentSetProps) => {
        const documentSet = state.documentSets[ownProps.documentSetId];
        const documentIds = documentSet ? documentSet.documentIds : [];

        return { documentIds, loaded: documentSet && documentSet.downloadStatus === Sign.DownloadStatus.Complete };
    },
    {
        requestDocumentSet
    }
)
class DocumentSet extends React.PureComponent<DocumentSetProps> {
    componentWillMount() {
        this.props.requestDocumentSet(this.props.documentSetId);
    }

    render() {
        if (!this.props.loaded) {
            return false;
        }

        return (
            <div>
                {this.props.documentIds.map(id => <PDFPage key={id} documentId={id} pageNumber={0} drawWidth={200} />)}
            </div>
        );
    }
}


class UploadDocuments extends React.Component<UploadDocumentsProps, {}> {
    _fileInput: HTMLInputElement;

    constructor(props: UploadDocumentsProps) {
        super(props);
        this.fileDrop = this.fileDrop.bind(this);
        this.collectFiles = this.collectFiles.bind(this);
        this.onClick = this.onClick.bind(this);
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


                    <DocumentList documents={this.props.documentSet.documents} removeDocument={this.props.removeDocument} />

                    { !!this.props.documentSet.documents.length && <div className="button-bar">
                        <Link to={`/documents/${this.props.documentSet.documents[0] ? this.props.documentSet.documents[0].id: 'no-id'}`} className={'btn btn-primary ' + (this.props.documentSet.documents.length === 0 ? 'disabled' : '')}>Sign Documents</Link>
                    </div> }
                </div>
            </FileDropZone>
        );
    }
}

const DNDUploadDocuments = DragDropContext(HTML5Backend)(UploadDocuments)

export default connect(state => ({
    documentSet: state.documentSet
}), {
    addDocument,
    removeDocument,
    updateDocument,
    addPDFToStore,
})(DNDUploadDocuments);