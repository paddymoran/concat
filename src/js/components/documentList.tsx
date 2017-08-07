import * as React from 'react';
import * as ReactDOM from "react-dom";
import { CSSTransitionGroup } from 'react-transition-group';
import PDFPage from './pdf/page';
import { connect } from 'react-redux';
import { removeDocument, reorderDocuments } from '../actions';
import { Link } from 'react-router';
import { findSetForDocument } from '../utils';
import { DragSource, DropTarget } from 'react-dnd';

interface ConnectedDocumentViewProps {
    documentId: string;
    showRemove: boolean;
}

interface DocumentViewProps extends ConnectedDocumentViewProps {
    document: Sign.Document;
    documentSetId: string;
    removeDocument: Function;
    connectDragSource: Function;
    connectDropTarget: Function;
    reorderDocuments: (payload: Sign.Actions.ReorderDocumentsPayload) => void;
}

interface DocumentListProps {
    documentIds: string[];
    showRemove: boolean;
    reorderable: boolean;
};

const A4_RATIO = 1.414;

const THUMBNAIL_WIDTH = 150;
const THUMBNAIL_HEIGHT = THUMBNAIL_WIDTH * A4_RATIO;

class DocumentView extends React.PureComponent<DocumentViewProps> {
    render() {
        return this.props.connectDragSource(
            this.props.connectDropTarget(
                <div className="document">
                    {this.props.showRemove && <button className="remove" onClick={() => this.props.removeDocument(this.props.documentId)}>✖</button>}

                    <PDFPage pageNumber={0} drawWidth={THUMBNAIL_WIDTH} documentId={this.props.documentId} showLoading={false}/>
                    <div className="filename">{ this.props.document && this.props.document.filename ? this.props.document.filename : '' }</div>

                    <CSSTransitionGroup transitionName="progress" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                        { this.props.document && this.props.document.uploadStatus === Sign.DocumentUploadStatus.InProgress &&
                            <div className="progress" key="progress">
                                <div className="progress-bar progress-bar-striped active" style={{width: `${this.props.document.progress*100}%`}}></div>
                            </div>
                        }
                    </CSSTransitionGroup>
                    
                    <Link to={`/documents/${this.props.documentSetId}/${this.props.documentId}`}>View</Link>
                </div>
            )
        );
    }
}

const ConnectedDocumentView = connect(
    (state: Sign.State, ownProps: ConnectedDocumentViewProps) => ({
        document: state.documents[ownProps.documentId],
        documentSetId: findSetForDocument(state.documentSets, ownProps.documentId)
    }),
    { removeDocument }
)(DocumentView);


const documentDragSource = {
    beginDrag(props) {
        return {
            documentId: props.documentId,
            index: props.index
        };
    }
};


const documentDragTarget = {
    hover(dropTargetProps, monitor, component) {
        const dragItem = monitor.getItem();

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
        monitor.getItem().index = dropTargetProps.index;
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

const ConnectedDraggableDroppableDocumentView = connect(
    undefined,
    { reorderDocuments }
)(DraggableDroppableDocumentView);

class DocumentList extends React.Component<DocumentListProps> {
    render() {
        return (
            <div className="document-list clearfix">
                {this.props.documentIds.map((documentId, index) => <ConnectedDraggableDroppableDocumentView showRemove={this.props.showRemove} key={documentId} index={index} documentId={documentId} />)}
            </div>
        );
    }
}

interface ConnectedDocumentListProps {
    documentSetId: string;
    showRemove?: boolean;
    reorderable?: boolean;
}

export default connect(
    (state: Sign.State, ownProps: ConnectedDocumentListProps) => ({
        documentIds: state.documentSets[ownProps.documentSetId].documentIds,
        showRemove: ownProps.showRemove !== undefined ? ownProps.showRemove : true,
        reorderable: ownProps.reorderable !== undefined ? ownProps.reorderable : true
    })
)(DocumentList);