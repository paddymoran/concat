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
    addDocuments: (files: File[]) => void;
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
        this.uploadDocuments(props);
    }

    componentWillMount() {
        if (!this.props.documentSet.id) {
            this.props.setDocumentSetId(); // This returns a promise. For now, we'll fire and forget
        }

        this.uploadDocuments(this.props);
    }

    uploadDocuments(props: UploadDocumentsProps) {
        const unUploaded = props.documentSet.documents.filter(doc => doc.status === Sign.DocumentUploadStatus.NotStarted);

        // Set each of the un-uploaded docs status to 'in progress' and the progress to 0
        unUploaded.map(doc => props.updateDocument({
            id: doc.id,
            status: Sign.DocumentUploadStatus.InProgress,
            progress: 0
        }));

        eachSeries(unUploaded, (doc: Sign.Document) => {
            // Read the document
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(doc.file);
            fileReader.onload = () => {
                props.updateDocument({
                    id: doc.id,
                    data: fileReader.result,
                });

                // Upload the document
                const data = new FormData();
                data.append('document_set_id', this.props.documentSet.id);
                data.append('document_id', doc.id);
                data.append('file[]', doc.file);

                const onUploadProgress = (progressEvent: any) => {
                    // upload loading percentage
                    const percentCompleted = progressEvent.loaded / progressEvent.total;
                    props.updateDocument({ id: doc.id, progress: percentCompleted });
                }

                return axios.post('/api/documents', data, { onUploadProgress })
                    .then((response) => {
                        // Complete the document upload and save the UUID
                        return props.updateDocument({
                            id: doc.id,
                            status: Sign.DocumentUploadStatus.Complete
                        });
                    });
            };
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
    addDocuments: (files: File[]) => {
        files.map(file => {
            return generateUUID()
                .then(uuid => addDocument({ filename: file.name, uuid, file }));
        });
    },
    removeDocument: removeDocument,
    updateDocument: updateDocument,
    setDocumentSetId: () => generateUUID().then(setDocumentSetId)
})(DNDUploadDocuments);