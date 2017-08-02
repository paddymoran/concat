import * as React from 'react';
import *  as HTML5Backend from 'react-dnd-html5-backend';
import FileDropZone from './fileDropZone';
import { connect } from 'react-redux';
import { DragDropContext } from 'react-dnd';
import { addDocument } from '../actions';
import { generateUUID } from './uuid';

interface DocumentHandlerProps {
    addDocuments: (files: File[]) => void,
    form: any,
}

class DocumentHandler extends React.Component<DocumentHandlerProps> implements Sign.DocumentHandler {
    _fileInput: HTMLInputElement;

    constructor(props: DocumentHandlerProps) {
        super(props);
        this.onDrop = this.onDrop.bind(this);
        this.collectFiles = this.collectFiles.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    onDrop(files: File[]) {
        this.props.addDocuments(files);
    }

    collectFiles(event: React.ChangeEvent<HTMLInputElement>) {
       this.onDrop([].filter.call(event.target.files, (f: File) => f.type === 'application/pdf'));
    }

    onClick() {
        if (this._fileInput) {
            this._fileInput.value = null;
            this._fileInput.click();
        }
    }

    render() {
        return  (
            <FileDropZone onDrop={this.onDrop}>
                <div className="explanation" onClick={this.onClick}>
                    Drag a PDF here to sign it
                    <input type="file" multiple name="files" style={{display: 'none'}} ref={(el) => this._fileInput = el} onChange={this.collectFiles}/>
                </div>
            </FileDropZone>
        );
    }
}

const DragContext = DragDropContext(HTML5Backend)(DocumentHandler)

export default connect(state => ({
    form: state.form
}), {
    addDocuments: (files: File[]) => files.map(file => generateUUID().then(documentId => addDocument({ documentId, filename: file.name, file }))),
})(DragContext);