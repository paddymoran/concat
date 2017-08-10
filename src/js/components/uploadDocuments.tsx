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


class UploadDocuments extends React.Component<UploadDocumentsProps> {
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


                    <DocumentList documentSetId={this.props.documentSetId} />

                    { !!this.props.documentIds && !!this.props.documentIds.length && <div className="button-bar">
                        <Link to={`/documents/${this.props.documentSetId}/${this.props.documentIds[0]}`} className={'btn btn-primary ' + (this.props.documentIds.length === 0 ? 'disabled' : '')}>Sign Documents</Link>
                    </div> }
                </div>
            </FileDropZone>
        );
    }
}

export default connect(
    (state: Sign.State, ownProps: any) => {
        const { documentSetId } = ownProps.params;

        return {
            documentIds: state.documentSets[documentSetId] ? state.documentSets[documentSetId].documentIds : null,
            documentSetId
        };
    },
    { addDocument, createDocumentSet }
)(UploadDocuments);