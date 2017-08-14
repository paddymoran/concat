import * as React from 'react';
import * as ReactDOM from "react-dom";
import { CSSTransitionGroup } from 'react-transition-group';
import PDFPage from './pdf/page';
import { connect } from 'react-redux';
import { removeDocument, reorderDocuments } from '../actions';
import { Link } from 'react-router';
import { findSetForDocument } from '../utils';
import { DragSource, DropTarget } from 'react-dnd';

interface DocumentViewProps {
    documentId: string;
    showRemove?: boolean;
    index: number;
    reorderDocuments: (payload: Sign.Actions.ReorderDocumentsPayload) => void;
}

interface ConnectedDocumentViewProps extends DocumentViewProps {
    document: Sign.Document;
    removeDocument: Function;
    connectDragSource: Function;
    connectDropTarget: Function;
}

interface DocumentListProps {
    documentSetId: string;
};

interface ConnectedDocumentListProps extends DocumentListProps{
    showRemove?: boolean;
    reorderable?: boolean;
    documentSetId: string;
    documentIds: string[];
    reorderDocuments: (payload: Sign.Actions.ReorderDocumentsPayload) => void;
};



const THUMBNAIL_WIDTH = 150;


class DocumentView extends React.PureComponent<ConnectedDocumentViewProps> {

    constructor(props: ConnectedDocumentViewProps) {
        super(props);
        this.removeDocument = this.removeDocument.bind(this);
    }

    removeDocument() {
        this.props.removeDocument(this.props.documentId);
    }

    render() {
        return this.props.connectDragSource(
            this.props.connectDropTarget(
                <div className="document">
                {this.props.showRemove && <button className="button-no-styles remove" onClick={this.removeDocument}><span className="fa fa-trash-o"/></button>}

                    <PDFPage pageNumber={0} drawWidth={THUMBNAIL_WIDTH} documentId={this.props.documentId} showLoading={false}/>
                    <div className="filename">{ this.props.document && this.props.document.filename ? this.props.document.filename : '' }</div>

                    <CSSTransitionGroup transitionName="progress" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                        { this.props.document && this.props.document.uploadStatus === Sign.DocumentUploadStatus.InProgress &&
                            <div className="progress" key="progress">
                                <div className="progress-bar progress-bar-striped active" style={{width: `${this.props.document.progress*100}%`}}></div>
                            </div>
                        }
                    </CSSTransitionGroup>

                    { /** <Link to={`/documents/${this.props.documentSetId}/${this.props.documentId}`}>View</Link> */ }
                </div>
            )
        );
    }
}

const ConnectedDocumentView = connect(
    (state: Sign.State, ownProps: DocumentViewProps) => ({
        document: state.documents[ownProps.documentId],
    }),
    { removeDocument }
)(DocumentView);


const documentDragSource: __ReactDnd.DragSourceSpec<DocumentViewProps> = {
    beginDrag(props) {
        return {
            documentId: props.documentId,
            index: props.index
        };
    }
};


const documentDragTarget: __ReactDnd.DropTargetSpec<DocumentViewProps> = {
    hover(dropTargetProps : ConnectedDocumentViewProps, monitor, component) {
        const dragItem : any = monitor.getItem();

        // Don't replace items with themselves
        if (dragItem.index === dropTargetProps.index) {
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

        dropTargetProps.reorderDocuments({
            documentId: dragItem.documentId,
            newIndex: dropTargetProps.index
        });

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        dragItem.index = dropTargetProps.index;
    }
};

const DraggableDocumentView = DragSource(
    'DOCUMENTS',
    documentDragSource,
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    })
)(ConnectedDocumentView);

const DraggableDroppableDocumentView = DropTarget(
    'DOCUMENTS',
    documentDragTarget,
    connect => ({
        connectDropTarget: connect.dropTarget()
    })
)(DraggableDocumentView);



class DocumentList extends React.PureComponent<ConnectedDocumentListProps> {
    render() {
        return (
            <div className="document-list clearfix">
                { this.props.documentIds.map((documentId, index) => <DraggableDroppableDocumentView reorderDocuments={this.props.reorderDocuments} showRemove={this.props.showRemove} key={documentId} index={index} documentId={documentId} />) }
            </div>
        );
    }
}



export default connect(
    (state: Sign.State, ownProps: DocumentListProps) => ({
        documentIds: state.documentSets[ownProps.documentSetId].documentIds
    }),  { reorderDocuments }
)(DocumentList);