import * as React from 'react';
import { connect } from 'react-redux';
import FileDropZone from './fileDropZone';
import DocumentList from './documentList';
import { addDocuments, removeDocument } from './actions';
import *  as HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

interface UploadDocumentsProps {
    documents: Sign.Documents;
    addDocuments: (files: File[]) => void;
    removeDocument: (id: number) => void;
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
    removeDocument: removeDocument
})(DNDUploadDocuments);