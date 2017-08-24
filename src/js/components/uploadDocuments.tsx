import * as React from 'react';
import { connect } from 'react-redux';
import FileDropZone from './fileDropZone';
import DocumentList from './documentList';
import { addDocument, requestDocumentSet, createDocumentSet } from '../actions';
import { generateUUID } from './uuid';
import  { Link } from 'react-router';
import HorizontalDocumentList from './horizontalDocumentList';

interface UploadDocumentsProps {
    documentIds: string[];
    addDocument: (payload: Sign.Actions.AddDocumentPayload) => void;
    createDocumentSet: (payload: Sign.Actions.DocumentSetPayload) => void;
    requestDocumentSet: (documentSetId: string) => void;
    nextLink: string;
    linkText: string;
    documentSetId: string;
}

interface ConnectedDocumentSetProps {
    documentSetId: string;
}

interface DocumentSetViewProps extends Sign.Components.RouteDocumentSet {

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
            <div >
                <div className='page-heading'>
                    <h1 className="title question">{this.props.documentSet.title ? this.props.documentSet.title : 'New Document Set'}</h1>
                </div>
                <HorizontalDocumentList documentSetId={this.props.documentSetId} />
            </div>
        );
    }
}

const ConnectedDocumentSet = connect(
    (state: Sign.State, ownProps: ConnectedDocumentSetProps) => {
        const documentSet = state.documentSets[ownProps.documentSetId];
        const documentIds = documentSet ? documentSet.documentIds : [];

        return {
            documentSet,
            loaded: documentSet && documentSet.downloadStatus === Sign.DownloadStatus.Complete
        };
    },
    {
        requestDocumentSet
    }
)(DocumentSet);


class Upload extends React.PureComponent<UploadDocumentsProps> {
    _fileInput: HTMLInputElement;

    constructor(props: UploadDocumentsProps) {
        super(props);
        this.fileDrop = this.fileDrop.bind(this);
        this.collectFiles = this.collectFiles.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    componentWillMount() {
        this.props.requestDocumentSet(this.props.documentSetId);
    }

    fileDrop(files: File[]) {
        files.map(file => generateUUID().then(uuid => this.props.addDocument({ documentId: uuid, documentSetId: this.props.documentSetId, filename: file.name, file: file })));
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
                <div>
                <div className='page-heading'>
                <h1 className="title question">Upload Documents</h1>
                <div className="sub-title step-count">Step 2</div>
                </div>

                <div className="explanation fake-drop-zone" onClick={this.onClick}>
                    <span className="drag-instruction">Drag PDFs here, or click to select</span>
                    <span className="drop-instruction">DROP HERE</span>
                        <input type="file" multiple name="files" style={{display: 'none'}} ref={(el) => this._fileInput = el} onChange={this.collectFiles}/>
                    </div>


                    <DocumentList documentSetId={this.props.documentSetId} showRemove={true}/>

                    { !!this.props.documentIds && !!this.props.documentIds.length && <div className="button-bar">
                        <Link to={this.props.nextLink} className={'btn btn-primary ' + (this.props.documentIds.length === 0 ? 'disabled' : '')}>{ this.props.linkText }</Link>
                    </div> }
                </div>
            </FileDropZone>
        );
    }
}

export const UploadDocuments = connect(
    (state: Sign.State, ownProps: any) => {
        const { documentSetId } = ownProps.params;
        const documentSet = state.documentSets[documentSetId];
        return {
            documentIds: documentSet ? documentSet.documentIds : null,
            documentSetId,
            nextLink: documentSet ? `/documents/${documentSetId}/${documentSet.documentIds[0]}` : null,
            linkText: 'Sign Documents'
        };
    },
    { addDocument, createDocumentSet,  requestDocumentSet }
)(Upload);


export const UploadDocumentsOthers = connect(
    (state: Sign.State, ownProps: any) => {
        const { documentSetId } = ownProps.params;
        const documentSet = state.documentSets[documentSetId];
        return {
            documentIds: documentSet ? documentSet.documentIds : null,
            documentSetId,
            nextLink: documentSet ? `/others_sign/select_recipients/${documentSetId}` : null,
            linkText: 'Select Recipients'
        };
    },
    { addDocument, createDocumentSet,  requestDocumentSet }
)(Upload);