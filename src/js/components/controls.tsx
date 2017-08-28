import * as React from 'react';
import { DragSource } from 'react-dnd';
import { SignatureButton, InitialButton } from './signatureSelector';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DateButton, TextButton } from './textSelector';
import * as Moment from 'moment';
import { connect } from 'react-redux';
import { OverlayTrigger,  Popover } from 'react-bootstrap';
import { setActiveSignControl, showInviteModal } from '../actions';


const SignatureTooltip = () => {
    return <Popover id="signature-tooltip" title="Signatures">Click to create a new signature.</Popover>;
}

const SignatureDragTooltip = () => {
    return <Popover id="signature-tooltip" title="Signatures">Click to toggle Signature Mode, or drag the thumbnail onto the page.</Popover>;
}

const InitialTooltip = () => {
    return <Popover id="signature-tooltip" title="Initials">Click to create a new initial.</Popover>;
}

const InitialDragTooltip = () => {
    return <Popover id="signature-tooltip" title="Initials">Click to toggle Initial Mode, or drag the thumbnail onto the page.</Popover>;
}


const DateTooltip = () => {
    return <Popover id="signature-tooltip" title="Dates">Click to toggle Date Mode, or drag the button onto the page.  You can edit the date and format once it was been placed.</Popover>;
}


const TextTooltip = () => {
    return <Popover id="signature-tooltip" title="Textbox">Click to toggle Textbox Mode, or drag the button onto the page.  You can edit the text once it was been placed.</Popover>;
}



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
    defaults?: Sign.DocumentSignature;
}

interface AddDateControlProps extends DragProps {
    defaults?: Sign.DocumentDate;
}
interface AddTextControlProps extends DragProps {
    defaults?: Sign.DocumentText;
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
        let { format, value, timestamp } = dateDefaults();

        if(props.defaults){
            if(props.defaults.format){
                format = props.defaults.format;
            }
            if(props.defaults.value){
                value = props.defaults.value;
            }
            if(props.defaults.timestamp){
                timestamp = props.defaults.timestamp;
            }
        }
        return {
            type: Sign.DragAndDropTypes.ADD_DATE_TO_DOCUMENT,
            format, timestamp, value
        };
    }
};

const textSource: __ReactDnd.DragSourceSpec<AddTextControlProps> = {
    beginDrag(props, monitor) {
        let { value } = textDefaults();
        if(props.defaults){
            if(props.defaults.value){
                value = props.defaults.value;
            }
        }
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

;


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
    hasSignature: boolean;
    hasInitial: boolean;
    hasDate: boolean;
    hasText: boolean;
    showInviteModal: (payload: Sign.Actions.ShowInviteModalPayload) => void;
    overlayDefaults: Sign.OverlayDefaults;
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

    signatureTooltip(children: JSX.Element){
        if(this.props.selectedSignatureId && !this.props.hasSignature){
            return this.tooltip(SignatureDragTooltip(), 750, children);
        }
        else if(!this.props.selectedSignatureId){
            return this.tooltip(SignatureTooltip(), 0, children);
        }
        return children;
    }

    initialTooltip(children: JSX.Element){
        if(this.props.selectedInitialId && !this.props.hasInitial){
            return this.tooltip(InitialDragTooltip(), 750, children);
        }
        else if(!this.props.selectedInitialId){
            return this.tooltip(InitialTooltip(), 0, children);
        }
        return children;
    }

    dateTooltip(children: JSX.Element){
        if(!this.props.hasDate){
            return this.tooltip(DateTooltip(), 750, children);
        }
        return children;
    }

    textTooltip(children: JSX.Element){
        if(!this.props.hasText){
            return this.tooltip(TextTooltip(), 750, children);
        }
        return children;
    }


    tooltip(tooltip: JSX.Element, delay:number, children: JSX.Element) {
        return <OverlayTrigger placement="bottom" overlay={tooltip} delayShow={delay}>
            <div style={{float:'left'}}>
                { children }
             </div>
        </OverlayTrigger>
    }

    render() {
        return (
            <div className="controls" onClick={this.activateNone}>
                <div className="container">

                    <div className="controls-left">


                        { this.signatureTooltip(<DraggableAddSignatureControl signatureId={this.props.selectedSignatureId}  defaults={this.props.overlayDefaults.signature}>
                            <div className="draggable">
                                <SignatureButton
                                    active={this.props.activeSignControl === Sign.ActiveSignControl.SIGNATURE}
                                    setActive={this.activateSignature} />
                            </div>
                        </DraggableAddSignatureControl>) }


                        { this.initialTooltip(<DraggableAddSignatureControl signatureId={this.props.selectedInitialId} defaults={this.props.overlayDefaults.signature}>
                            <div className="draggable">
                                <InitialButton
                                    active={this.props.activeSignControl === Sign.ActiveSignControl.INITIAL}
                                    setActive={this.activateInitial} />
                            </div>
                        </DraggableAddSignatureControl>) }

                        { this.dateTooltip(<DraggableAddDateControl defaults={this.props.overlayDefaults.date}>
                            <div className="draggable">
                                <DateButton
                                    active={this.props.activeSignControl === Sign.ActiveSignControl.DATE}
                                    setActive={this.activateDate} />
                            </div>
                        </DraggableAddDateControl>) }

                        { this.textTooltip(<DraggableAddTextControl defaults={this.props.overlayDefaults.text}>
                            <div className="draggable">
                                <TextButton
                                    active={this.props.activeSignControl === Sign.ActiveSignControl.TEXT}
                                    setActive={this.activateText} />
                            </div>
                        </DraggableAddTextControl> ) }
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
        activeSignControl: state.documentViewer.activeSignControl,
        hasSignature: !!Object.keys(state.documentViewer.signatures).length,
        hasInitial: !!Object.keys(state.documentViewer.signatures).length,
        hasDate: !!Object.keys(state.documentViewer.dates).length,
        hasText: !!Object.keys(state.documentViewer.texts).length,
        overlayDefaults: state.overlayDefaults,
    }),
    { setActiveSignControl, showInviteModal }
)(UnconnectedControls)