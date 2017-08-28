import * as React from 'react';
import { DragSource } from 'react-dnd';
import { SignatureButton, InitialButton } from './signatureSelector';

import { getEmptyImage } from 'react-dnd-html5-backend';
import { DateButton, TextButton } from './textSelector';
import * as Moment from 'moment';
import { connect } from 'react-redux';
import { setActiveSignControl, showInviteModal } from '../actions';


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

export function dateDefaults(){
    const format = 'DD MMMM YYYY', timestamp = (new Date()).getTime();
    return {
        format,
        value: Moment(timestamp).format(format),
        timestamp
    }
}

export function textDefaults(){
    const value = 'Custom Text...';
    return {
        value
    }
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

        return {
            type: Sign.DragAndDropTypes.ADD_DATE_TO_DOCUMENT,
            ...dateDefaults()
        };
    }
};

const textSource: __ReactDnd.DragSourceSpec<AddTextControlProps> = {
    beginDrag(props, monitor) {
        return {
            type: Sign.DragAndDropTypes.ADD_TEXT_TO_DOCUMENT,
            ...textDefaults()
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
    documentSetId: string;
    documentId: string;
}

interface ConnectedControlProps extends ControlProps{
    selectedSignatureId?: number;
    selectedInitialId?: number;
    setActiveSignControl: (payload: Sign.Actions.SetActiveSignControlPayload) => void;
    activeSignControl: Sign.ActiveSignControl;
    showInviteModal: (payload: Sign.Actions.ShowInviteModalPayload) => void;
}

class UnconnectedControls extends React.PureComponent<ConnectedControlProps> {
    constructor(props: ConnectedControlProps){
        super(props);
        this.activateNone = this.activateNone.bind(this);
        this.activateSignature = this.activateSignature.bind(this);
        this.activateInitial = this.activateInitial.bind(this);
        this.activateDate = this.activateDate.bind(this);
        this.activateText = this.activateText.bind(this);
    }

    activateNone() {
        this.props.setActiveSignControl({activeSignControl: Sign.ActiveSignControl.NONE})
    }
    activateSignature() {
        this.props.setActiveSignControl({activeSignControl: Sign.ActiveSignControl.SIGNATURE})
    }
     activateInitial() {
        this.props.setActiveSignControl({activeSignControl: Sign.ActiveSignControl.INITIAL})
    }
    activateDate() {
        this.props.setActiveSignControl({activeSignControl: Sign.ActiveSignControl.DATE})
    }
     activateText() {
        this.props.setActiveSignControl({activeSignControl: Sign.ActiveSignControl.TEXT})
    }

    render() {
        return (
            <div className="controls" onClick={this.activateNone}>
                <div className="container">

                    <div className="controls-left">
                        <DraggableAddSignatureControl signatureId={this.props.selectedSignatureId}>
                            <div className="draggable">
                                <SignatureButton
                                    active={this.props.activeSignControl === Sign.ActiveSignControl.SIGNATURE}
                                    setActive={this.activateSignature} />
                            </div>
                        </DraggableAddSignatureControl>

                        <DraggableAddSignatureControl signatureId={this.props.selectedInitialId}>
                            <div className="draggable">
                                <InitialButton
                                    active={this.props.activeSignControl === Sign.ActiveSignControl.INITIAL}
                                    setActive={this.activateInitial} />
                            </div>
                        </DraggableAddSignatureControl>

                        <DraggableAddDateControl >
                            <div className="draggable">
                                <DateButton
                                    active={this.props.activeSignControl === Sign.ActiveSignControl.DATE}
                                    setActive={this.activateDate} />
                            </div>
                        </DraggableAddDateControl>

                        <DraggableAddTextControl >
                            <div className="draggable">
                                <TextButton
                                    active={this.props.activeSignControl === Sign.ActiveSignControl.TEXT}
                                    setActive={this.activateText} />
                            </div>
                        </DraggableAddTextControl>
                    </div>

                    <div className="controls-right">
                        <div className="sign-control" onClick={() => this.props.showInviteModal({ documentSetId: this.props.documentSetId })}>
                            Invite
                        </div>

                        <div className="submit-button sign-control" onClick={this.props.sign}>
                            <div>
                                <i className="fa fa-pencil" />&nbsp;&nbsp;Sign
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export const Controls = connect<{}, {}, ControlProps>(
    (state: Sign.State) => ({
        selectedSignatureId: state.documentViewer.selectedSignatureId,
        selectedInitialId: state.documentViewer.selectedInitialId,
        activeSignControl: state.documentViewer.activeSignControl
    }),
    { setActiveSignControl, showInviteModal }
)(UnconnectedControls)