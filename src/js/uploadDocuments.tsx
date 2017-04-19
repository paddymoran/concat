import * as React from 'react';
import { connect } from 'react-redux';
import FileDropZone from './fileDropZone';
import DocumentList from './documentList';
import { addDocuments, removeDocument, updateDocument } from './actions';
import *  as HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import axios from 'axios';
// import uuidv4 from 'uuid/v4';

interface UploadDocumentsProps {
    documents: Sign.Documents;
    addDocuments: (files: File[]) => void;
    removeDocument: (id: number) => void;
    updateDocument: Function;
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
        this.uploadDocuments(props);
    }

    componentWillMount() {
        this.uploadDocuments(this.props);
    }

    uploadDocuments(props: UploadDocumentsProps) {
        const unUploaded = props.documents.filelist.filter(doc => doc.status === Sign.DocumentUploadStatus.NotStarted);

        // Set each of the un-uploaded docs status to 'in progress' and the progress to 0
        unUploaded.map(doc => props.updateDocument({
            id: doc.id,
            status: Sign.DocumentUploadStatus.InProgress,
            progress: 0
        }));


        eachSeries(unUploaded, (doc: Sign.Document) => {
            const data = new FormData();
            data.append('document_set_id', '3953b86f-896e-4884-86cc-985673700c27');
            data.append('file[]', doc.file);

            const onUploadProgress = (progressEvent: any) => {
                // upload loading percentage
                const percentCompleted = progressEvent.loaded / progressEvent.total;
                props.updateDocument({ id: doc.id, progress: percentCompleted });
            }

            return axios.post('/api/documents/upload', data, { onUploadProgress })
                .then((response) => {
                    // Complete the document upload and save the UUID
                    props.updateDocument({
                        id: doc.id,
                        status: Sign.DocumentUploadStatus.Complete,
                        uuid: response.data[doc.filename]
                    });
                })
        });
    }

    fileDrop(files: File[]) {
        this.props.addDocuments(files);
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
                    <DocumentList documents={this.props.documents} removeDocument={this.props.removeDocument} />
                    
                    <div className="button-bar">
                        <a href={''} className={'btn btn-primary ' + (this.props.documents.filelist.length === 0 ? 'disabled' : '')}>Sign</a>
                    </div>
                </div>
            </FileDropZone>
        );
    }
}

const DNDUploadDocuments = DragDropContext(HTML5Backend)(UploadDocuments)

export default connect(state => ({
    documents: state.documents
}), {
    addDocuments: (files: File[]) => addDocuments(files.map((file) => ({ filename: file.name, file }))),
    removeDocument: removeDocument,
    updateDocument: updateDocument
})(DNDUploadDocuments);