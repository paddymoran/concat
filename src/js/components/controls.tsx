import * as React from 'react';
import { DragSource } from 'react-dnd';
import { SignatureButton, InitialButton } from './signatureSelector';

import { getEmptyImage } from 'react-dnd-html5-backend';
import { DateButton, TextButton } from './textSelector';
import * as Moment from 'moment';
import { connect } from 'react-redux';
import { setActiveSignControl } from '../actions';


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
    sign: () => void;
}

interface ConnectedControlProps extends ControlProps{
    selectedSignatureId?: number;
    selectedInitialId?: number;
    setActiveSignControl: (payload: Sign.Actions.SetActiveSignControlPayload) => void;
    activeSignControl: Sign.ActiveSignControl;
}

class UnconnectedControls extends React.PureComponent<ConnectedControlProps> {
    setActiveSignControl(activeSignControl: Sign.ActiveSignControl) {
        this.props.setActiveSignControl({ activeSignControl });
    }

    render() {
        return (
            <div className="controls">
                <div className="container">

                    <div className="control-row">
                        <div className="control">
                            <DraggableAddSignatureControl signatureId={this.props.selectedSignatureId}>
                                <div className="draggable">
                                    <SignatureButton
                                        active={this.props.activeSignControl === Sign.ActiveSignControl.SIGNATURE}
                                        setActive={() => this.setActiveSignControl(Sign.ActiveSignControl.SIGNATURE)} />
                                </div>
                            </DraggableAddSignatureControl>
                        </div>

                        <div className="control">
                            <DraggableAddSignatureControl signatureId={this.props.selectedInitialId}>
                                <div className="draggable">
                                    <InitialButton
                                        active={this.props.activeSignControl === Sign.ActiveSignControl.INITIAL}
                                        setActive={() => this.setActiveSignControl(Sign.ActiveSignControl.INITIAL)} />
                                </div>
                            </DraggableAddSignatureControl>
                        </div>

                        <div className="control">
                            <DraggableAddDateControl >
                                <div className="draggable">
                                    <DateButton
                                        active={this.props.activeSignControl === Sign.ActiveSignControl.DATE}
                                        setActive={() => this.setActiveSignControl(Sign.ActiveSignControl.DATE)} />
                                </div>
                            </DraggableAddDateControl>
                        </div>

                        <div className="control">
                            <DraggableAddTextControl >
                                <div className="draggable">
                                    <TextButton
                                        active={this.props.activeSignControl === Sign.ActiveSignControl.TEXT}
                                        setActive={() => this.setActiveSignControl(Sign.ActiveSignControl.TEXT)} />
                                </div>
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
        );
    }
}

export const Controls = connect<void, void, ControlProps>(
    (state: Sign.State) => ({
        selectedSignatureId: state.documentViewer.selectedSignatureId,
        selectedInitialId: state.documentViewer.selectedInitialId,
        activeSignControl: state.documentViewer.activeSignControl
    }),
    { setActiveSignControl }
)(UnconnectedControls)