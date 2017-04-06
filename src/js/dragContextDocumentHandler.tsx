import * as React from 'react';
import *  as HTML5Backend from 'react-dnd-html5-backend';
import FileDropZone from './fileDropZone';
import { connect } from 'react-redux';
import { DragDropContext } from 'react-dnd';
import { addDocuments } from './actions';

interface IDocumentHandler {
    onDrop(files: any);
};

interface DocumentHandlerProps {
    addDocuments:(files: any) => void,
    documents: any,
    form: any,
};

class DocumentHandler extends React.Component<DocumentHandlerProps, {}> implements IDocumentHandler {
    _fileInput: HTMLInputElement;

    constructor(props: DocumentHandlerProps) {
        super(props);
        this.onDrop = this.onDrop.bind(this);
        this.collectFiles = this.collectFiles.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    onDrop(files: File[]) {
        this.props.addDocuments(
            files.map((file) => ({ filename: file.name, file }))
        );
    }

    collectFiles(event) {
       this.onDrop([].filter.call(event.target.files, (f: File) => f.type === 'application/pdf'));
    }

    onClick() {
        if (this._fileInput) {
            this._fileInput.value = null;
            this._fileInput.click();
        }
    }

    render() {
        const loaded = !!this.props.documents.filelist.length && this.props.documents.filelist.every(f => f.status === 'complete');
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

export default connect(state => ({ documents: state.documents, form: state.form }), { addDocuments: addDocuments })(DragContext);