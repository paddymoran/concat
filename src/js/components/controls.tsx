import * as React from 'react';
import { DragSource } from 'react-dnd';
import { SignatureButton, InitialButton } from './signatureSelector';

import { getEmptyImage } from 'react-dnd-html5-backend';
import { DateButton, TextButton } from './textSelector';
import * as Moment from 'moment';


interface SignatureDragSourceProps {
    signatureId: number;
}

interface DragProps {
    connectDragSource?: Function;
    connectDragPreview?: Function;
    isDragging?: boolean;
}


interface AddSignatureControlProps extends DragProps {
    signatureId: number;
}

interface AddDateControlProps extends DragProps {

}
interface AddTextControlProps extends DragProps {

}


const signatureSource: __ReactDnd.DragSourceSpec<AddSignatureControlProps> = {
    beginDrag(props, monitor) {
        const { signatureId } = props;
        return {
            signatureId,
            type: Sign.DragAndDropTypes.ADD_SIGNATURE_TO_DOCUMENT
        };
    }
};

const dateSource: __ReactDnd.DragSourceSpec<AddDateControlProps> = {
    beginDrag(props, monitor) {
        const format = 'DD MMMM YYYY', timestamp = (new Date()).getTime();
        return {
            type: Sign.DragAndDropTypes.ADD_DATE_TO_DOCUMENT,
            format,
            value: Moment(timestamp).format(format),
            timestamp
        };
    }
};

const textSource: __ReactDnd.DragSourceSpec<AddTextControlProps> = {
    beginDrag(props, monitor) {
        const value = 'Custom Text...';
        return {
            type: Sign.DragAndDropTypes.ADD_TEXT_TO_DOCUMENT,
            value
        };
    }
};


class AddSignatureControl extends React.PureComponent<AddSignatureControlProps> {
    componentDidMount() {
        // Use empty image as a drag preview so browsers don't draw it
        // and we can draw whatever we want on the custom drag layer instead.
        this.props.connectDragPreview(getEmptyImage(), {
          // IE fallback: specify that we'd rather screenshot the node
          // when it already knows it's being dragged so we can hide it with CSS.
          captureDraggingState: true,
        });
    }

    render() {
        const { isDragging } = this.props;
        if(this.props.signatureId){
            return this.props.connectDragSource(this.props.children);
        }
        return this.props.children;
    }
}


class AddDateControl extends React.PureComponent<AddDateControlProps> {
    componentDidMount() {
        // Use empty image as a drag preview so browsers don't draw it
        // and we can draw whatever we want on the custom drag layer instead.
        this.props.connectDragPreview(getEmptyImage(), {
          // IE fallback: specify that we'd rather screenshot the node
          // when it already knows it's being dragged so we can hide it with CSS.
          captureDraggingState: true,
        });

    }

    render() {
        const { isDragging } = this.props;
        return this.props.connectDragSource(this.props.children);
    }
}



class AddTextControl extends React.PureComponent<AddTextControlProps> {
    componentDidMount() {
        // Use empty image as a drag preview so browsers don't draw it
        // and we can draw whatever we want on the custom drag layer instead.
        this.props.connectDragPreview(getEmptyImage(), {
          // IE fallback: specify that we'd rather screenshot the node
          // when it already knows it's being dragged so we can hide it with CSS.
          captureDraggingState: true,
        });

    }

    render() {
        const { isDragging } = this.props;
        return this.props.connectDragSource(this.props.children);
    }
}



const DraggableAddSignatureControl = DragSource(
    Sign.DragAndDropTypes.ADD_SIGNATURE_TO_DOCUMENT,
    signatureSource,
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    })
)(AddSignatureControl);


const DraggableAddDateControl = DragSource(
    Sign.DragAndDropTypes.ADD_DATE_TO_DOCUMENT,
    dateSource,
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    })
)(AddDateControl);

const DraggableAddTextControl = DragSource(
    Sign.DragAndDropTypes.ADD_TEXT_TO_DOCUMENT,
    textSource,
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    })
)(AddTextControl);

interface ControlProps {
    selectedSignatureId?: number;
    selectedInitialId?: number;
    sign: () => void;
}

export class Controls extends React.PureComponent<ControlProps> {
    render() {
        return <div className="controls">
          <div className="container">

                <div className="control-row">
                <div className="control">
                    <DraggableAddSignatureControl signatureId={this.props.selectedSignatureId}>
                          <div className="draggable"> <SignatureButton /></div>
                    </DraggableAddSignatureControl>
                </div>

                <div className="control">
                    <DraggableAddSignatureControl signatureId={this.props.selectedInitialId}>
                            <div className="draggable"> <InitialButton /></div>
                    </DraggableAddSignatureControl>
               </div>

                <div className="control">

                    <DraggableAddDateControl >
                            <div className="draggable"> <DateButton /></div>
                    </DraggableAddDateControl>

                </div>
                <div className="control">

                    <DraggableAddTextControl >
                            <div className="draggable"> <TextButton /></div>
                    </DraggableAddTextControl>

                </div>

                <div className="control">

                <div className="submit-button" onClick={ this.props.sign }>
                            <span className="fa fa-pencil" />
                            <span>Sign</span>
                </div>

                </div>
                </div>

            </div>
        </div>
    }
}
