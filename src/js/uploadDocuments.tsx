import * as React from 'react';
import { connect } from 'react-redux';
import FileDropZone from './fileDropZone';
import DocumentList from './documentList';
import { addDocuments, removeDocument, updateDocument } from './actions';
import *  as HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import axios from 'axios';

interface UploadDocumentsProps {
    documents: Sign.Documents;
    addDocuments: (files: File[]) => void;
    removeDocument: (id: number) => void;
    updateDocument: Function;
}

function eachSeries(arr: Array<any>, iteratorFn: Function) {
    return arr.reduce(function (p, item) {
        return p.then(function () {
            return iteratorFn(item);
        });
    }, Promise.resolve());
}


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
        const unUploaded = props.documents.filelist.filter(d => !d.status);
        unUploaded.map(doc => {
            props.updateDocument({ id: doc.id, status: 'posting', progress: 0 });
        });
        eachSeries(unUploaded, (doc: Sign.Document) => {
            const data = new FormData();
            data.append('file[]', doc.file);

            const onUploadProgress = (progressEvent: any) => {
                // upload loading percentage
                const percentCompleted = progressEvent.loaded / progressEvent.total;
                props.updateDocument({ id: doc.id, progress: percentCompleted });
            }

            return axios.post('/api/documents/upload', data, { onUploadProgress: onUploadProgress })
                .then((response) => {
                    console.log(response);
                    props.updateDocument({ id: doc.id, status: 'complete', uuid: response.data[doc.filename] });
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
            <div className="container">
                <FileDropZone onDrop={this.fileDrop}>
                    <div className="explanation" onClick={this.onClick}>
                        Drag PDFs here to sign them
                        <input type="file" multiple name="files" style={{display: 'none'}} ref={(el) => this._fileInput = el} onChange={this.collectFiles}/>
                    </div>
                    
                    <div className="container">
                        <DocumentList documents={this.props.documents} removeDocument={this.props.removeDocument} />
                        
                        <div className="button-bar">
                            <a href={''} className="btn btn-primary">Sign</a>
                        </div>
                    </div>
                </FileDropZone>
            </div>
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