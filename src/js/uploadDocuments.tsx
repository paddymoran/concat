import * as React from 'react';
import { connect } from 'react-redux';
import FileDropZone from './fileDropZone';
import DocumentList from './documentList';
import { addDocument, removeDocument, updateDocument, setDocumentSetId } from './actions';
import *  as HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import axios from 'axios';
import { generateUUID } from './uuid';

interface UploadDocumentsProps {
    documentSet: Sign.DocumentSet;
    addDocument: Function;
    removeDocument: (id: number) => void;
    setDocumentSetId: () => void;
    updateDocument: Function;
    getPDF: Function;
}

const eachSeries = (arr: Array<any>, iteratorFn: Function) => arr.reduce(
    (p, item) => p.then(() => iteratorFn(item)),
    Promise.resolve()
);


class UploadDocuments extends React.Component<UploadDocumentsProps, {}> {
    _fileInput: HTMLInputElement;

    constructor(props: UploadDocumentsProps) {
        super(props);
        this.fileDrop = this.fileDrop.bind(this);
        this.collectFiles = this.collectFiles.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    componentWillReceiveProps(props: UploadDocumentsProps) {
        this.uploadDocuments(props.documentSet);
    }

    componentWillMount() {
        if (!this.props.documentSet.id) {
            generateUUID().then(this.props.setDocumentSetId)
        }

        this.uploadDocuments(this.props.documentSet);
    }

    uploadDocuments(documentSet: Sign.DocumentSet) {
        const unUploaded = documentSet.documents.filter(doc => doc.status === Sign.DocumentUploadStatus.NotStarted);

        // Set each of the un-uploaded docs status to 'in progress' and the progress to 0
        unUploaded.map(doc => this.props.updateDocument({
            id: doc.id,
            status: Sign.DocumentUploadStatus.InProgress,
            progress: 0
        }));

        eachSeries(unUploaded, (doc: Sign.Document) => {
            // Read the document
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(doc.file);
            fileReader.onload = () => {
                this.props.updateDocument({
                    id: doc.id,
                    data: fileReader.result,
                });

                // Upload the document
                const data = new FormData();
                data.append('document_set_id', this.props.documentSet.id);
                data.append('document_id', doc.id);
                data.append('file[]', doc.file);

                const onUploadProgress = (progressEvent: any) => {
                    // Update uploading percentage
                    const percentCompleted = progressEvent.loaded / progressEvent.total;
                    this.props.updateDocument({ id: doc.id, progress: percentCompleted });
                }

                // Upload the document
                return axios.post('/api/documents', data, { onUploadProgress })
                    .then((response) => this.props.updateDocument({ status: Sign.DocumentUploadStatus.Complete }));
            };
        });
    }

    fileDrop(files: File[]) {
        files.map(file => {
            return generateUUID()
                .then(uuid => this.props.addDocument({ filename: file.name, id: uuid, file }));
        });
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
                <h1 className="title">Upload Documents</h1>
                <div className="sub-title">Step 2</div>

                <div className="explanation" onClick={this.onClick}>
                    Drag PDFs here to sign them
                    <input type="file" multiple name="files" style={{display: 'none'}} ref={(el) => this._fileInput = el} onChange={this.collectFiles}/>
                </div>
                
                <div className="container">
                    <DocumentList documents={this.props.documentSet.documents} removeDocument={this.props.removeDocument} getPDF={this.props.getPDF} />
                    
                    <div className="button-bar">
                        <a href={''} className={'btn btn-primary ' + (this.props.documentSet.documents.length === 0 ? 'disabled' : '')}>Sign</a>
                    </div>
                </div>
            </FileDropZone>
        );
    }
}

const DNDUploadDocuments = DragDropContext(HTML5Backend)(UploadDocuments)

export default connect(state => ({
    documentSet: state.documentSet
}), {
    addDocument: addDocument,
    removeDocument: removeDocument,
    updateDocument: updateDocument,
    setDocumentSetId: setDocumentSetId
})(DNDUploadDocuments);