import "babel-polyfill";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider, connect } from 'react-redux';
import { Store, createStore } from 'redux';
import configureStore from './configureStore';
import '../style/style.scss';
import { addDocuments, updateDocument, submitDocuments, removeDocument, updateForm } from './actions';
import Header from './header';
import Footer from './footer';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { DragSource, DropTarget, DragDropContext } from 'react-dnd';
import *  as HTML5Backend from 'react-dnd-html5-backend';
import { PDFViewer } from './pdfViewer'


const serialize = function(obj, prefix?) {
    var str = [];
    for(var p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + "[]" : p, v = obj[p];
            str.push(typeof v == "object" ?
            serialize(v, k) :
            k + "=" + encodeURIComponent(v));
        }
    }
    return str.filter(s => s).join("&");
}

function eachSeries(arr: Array<any>, iteratorFn: Function) {
    return arr.reduce(function(p, item) {
        return p.then(function() {
            return iteratorFn(item);
        });
    }, Promise.resolve());
}

const store = configureStore({});

type Document = {
    filename: string;
    uuid?: string;
    file: File;
    status: string;
    data: ArrayBuffer;
    progress?: number;
};


interface DocumentHandlerProps {
    addDocuments(files: any);
    updateDocument(options: Object);
    submitDocuments(options: Object);
    removeDocument(options: Object);
    updateForm(options: Object);
    documents: any;
    form: any;
};


interface AppProps {
    documents: any;
    form: any;
    updateDocument: Function;
    removeDocument: Function;
}


interface DocumentViewProps {
    document: Document;
    removeDocument: Function;
    updateDocument: Function;
    index: number;
}


interface IDocumentHandler {
    onDrop(files: any);
};


interface FileReaderEventTarget extends EventTarget {
    result:string
}


interface FileReaderEvent extends Event {
    target: FileReaderEventTarget;
    getMessage():string;
}


const documentDragSource = {
    beginDrag(props) {
        return {
            id: props.id,
            index: props.index
        };
    }
};


const documentDragTarget = {
    hover(props, monitor, component) {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;
        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
            return;
        }

        // Determine rectangle on screen
        const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();

        // Get vertical middle
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        // Determine mouse position
        const clientOffset = monitor.getClientOffset();

        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
        // props.moveDocument(dragIndex, hoverIndex);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        monitor.getItem().index = hoverIndex;
    }
};

class DocumentView extends React.Component<DocumentViewProps, {}>  {

    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(props) {
        this.uploadData(props);
    }

    componentWillMount() {
        this.uploadData(this.props);
    }

    uploadData(props) {
        if (!props.document.status) {
            // Update file upload progress
            props.updateDocument({id: props.document.id, status: 'posting', progress: 0});

            // Create file reader, read file to BLOB, then call the updateDocument action
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(props.document.file);
            fileReader.onload = () => {
                props.updateDocument({
                    id: props.document.id,
                    arrayBuffer: fileReader.result,
                    status: 'complete'
                });
            };
        }
    }

    render() {
        return (
            <div className='pdf-screen'>
                { this.props.document.arrayBuffer && 
                    <PDFViewer 
                        file={this.props.document}
                        data={this.props.document.arrayBuffer}  
                        worker={false}
                        removeDocument={() => {this.props.removeDocument()}} />
                }
            </div>
        );
    }
}

const DraggableDocumentView = DragSource('DOCUMENTS', documentDragSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))(DocumentView);

const DraggableDroppableDocumentView = DropTarget('DOCUMENTS', documentDragTarget, connect => ({
    connectDropTarget: connect.dropTarget()
}))(DraggableDocumentView);

class FileDropZone extends React.Component<{connectDropTarget: Function, isOver: boolean, canDrop: boolean}, {}> {
    render() {
        const { connectDropTarget, isOver, canDrop } = this.props;
        return connectDropTarget(<div className="dropzone">
                                 { this.props.children }
                                 <div className="push-catch"></div>
                                </div>
        );
    }
}

const fileTarget = {
    drop(props, monitor) {
        props.onDrop(monitor.getItem().files.filter(f => f.type === 'application/pdf'));
    }
};

const ConnectedFileDropZone = DropTarget("__NATIVE_FILE__", fileTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
}))(FileDropZone);


class DocumentHandler extends React.Component<DocumentHandlerProps, {}> implements IDocumentHandler {
    _fileInput;

    constructor(props){
        super(props);
        this.onDrop = this.onDrop.bind(this);
        this.collectFiles = this.collectFiles.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    onDrop(files) {
        this.props.addDocuments(files.map(f => ({
            filename: f.name,
            file: f
        })));
    }

    collectFiles(event) {
       this.onDrop([].filter.call(event.target.files, f => f.type === 'application/pdf'));
    }

    onClick() {
        if (this._fileInput) {
            this._fileInput.value = null;
            this._fileInput.click();
        }
    }

    render() {
        const loaded = !!this.props.documents.filelist.length && this.props.documents.filelist.every(f => f.status === 'complete');
        const url = '/concat?' + serialize({file_ids: this.props.documents.filelist.map(f => f.uuid), deskew: this.props.form.deskew || false});
        return  (
            <ConnectedFileDropZone onDrop={this.onDrop}>
                <Header />
                <div className="body">
                    <div className="explanation" onClick={this.onClick}>
                        Drag a PDF here to sign it
                        <input type="file" multiple name="files" style={{display: 'none'}} ref={(el) => this._fileInput = el} onChange={this.collectFiles}/>
                    </div>
                    <Footer />
                </div>
            </ConnectedFileDropZone>)
    }
}

const DragContext = DragDropContext(HTML5Backend)(DocumentHandler)

const DragContextDocumentHandlerConnected  = connect(state => ({documents: state.documents, form: state.form}), {
    addDocuments: addDocuments,
    updateDocument: updateDocument,
    submitDocuments: submitDocuments,
    removeDocument: removeDocument,
    updateForm: updateForm
})(DragContext);



class App extends React.Component<AppProps, {}> {
    render() {
        const doc = this.props.documents.filelist[0];

        if (doc) {
            return (
                <div>
                    <Header />
                    <div className="body">
                        <DocumentView
                            document={doc}
                            key={doc.id}
                            index={doc.id}
                            updateDocument={this.props.updateDocument}
                            removeDocument={() => this.props.removeDocument({id: doc.id})} />
                    </div>
                    <Footer />
                </div>
            );
        } else {
            return <DragContextDocumentHandlerConnected  />
        }
    }
}

const ConnectedApp = connect(state => ({documents: state.documents, form: state.form}), {
    addDocuments: addDocuments,
    updateDocument: updateDocument,
    submitDocuments: submitDocuments,
    removeDocument: removeDocument,
    updateForm: updateForm
})(App);

ReactDOM.render(
    <Provider store={store}>
        <ConnectedApp />
    </Provider>,
    document.getElementById("main")
);
