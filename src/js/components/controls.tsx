import * as React from 'react';
import { DragSource } from 'react-dnd';
import { SignatureButton, InitialButton } from './signatureSelector';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DateButton, TextButton, PromptButton } from './controlButtons';
import * as Moment from 'moment';
import { connect } from 'react-redux';
import { OverlayTrigger, Popover, Modal } from 'react-bootstrap';
import { setActiveSignControl, showInviteModal, showRejectConfirmationModal, closeModal, showActivateControlModal } from '../actions';
import { dateDefaults, textDefaults } from '../utils';
import  * as Scroll from 'react-scroll/modules/mixins/scroller';

/**
 * Control tooltips
 */
const SignatureTooltip = () => <Popover id="signature-tooltip" title="Signatures">Click to create a new signature.</Popover>;
const SignatureDragTooltip = () => <Popover id="signature-tooltip" title="Signatures">Click to toggle Signature Mode, or drag the signature onto the page.</Popover>;
const InitialTooltip = () => <Popover id="signature-tooltip" title="Initials">Click to create a new initial.</Popover>;
const InitialDragTooltip = () => <Popover id="signature-tooltip" title="Initials">Click to toggle Initial Mode, or drag the initial onto the page.</Popover>;
const DateTooltip = () => <Popover id="signature-tooltip" title="Dates">Click to toggle Date Mode, or drag the button onto the page.  You can edit the date and format once it was been placed.</Popover>;
const TextTooltip = () => <Popover id="signature-tooltip" title="Textbox">Click to toggle Textbox Mode, or drag the button onto the page.  You can edit the text once it was been placed.</Popover>;
const PromptTooltip = () => <Popover id="signature-tooltip" title="Signature Request">Click to toggle Sign Here Mode, or drag the button onto the page.  You can edit who is prompt is intended for, and what they must enter, once it was been placed.</Popover>;

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

interface AddPromptControlProps extends DragProps {
    defaults?: Sign.DocumentPrompt;
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

const promptSource: __ReactDnd.DragSourceSpec<AddPromptControlProps> = {
    beginDrag(props, monitor) {
        let value = {
            type: 'signature'
        }
        if(props.defaults){
            if(props.defaults.value){
                value = props.defaults.value;
            }
        }
        return {
            type: Sign.DragAndDropTypes.ADD_PROMPT_TO_DOCUMENT,
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
};

class AddPromptControl extends React.PureComponent<AddPromptControlProps> {
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
};

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

const DraggableAddPromptControl = DragSource(
    Sign.DragAndDropTypes.ADD_PROMPT_TO_DOCUMENT,
    promptSource,
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    })
)(AddPromptControl);

interface ConditionalTooltipProps {
    condition: boolean;
    delay?: number;
    tooltip: JSX.Element;
}

class ConditionalTooltip extends React.PureComponent<ConditionalTooltipProps> {
    render() {
        const delay = this.props.delay;
        const { tooltip, children } = this.props;

        if (this.props.condition) {
            return (
                <OverlayTrigger placement="bottom" overlay={tooltip} delayShow={delay}>
                    <div style={{float:'left'}}>
                        {children}
                    </div>
                </OverlayTrigger>
            );
        }

        return <div>{children}</div>;
    }
}

interface ControlProps {
    sign: () => void;
    send: () => void;
    next?: () => void;
    save: () => void;
    showInvite: boolean;
    showPrompts: boolean;
    showSave: boolean;
    showReject: boolean;
    documentSetId: string;
    documentId: string;
    requestedSignatureInfo?: Sign.RequestedSignatureDocumentInfo;
    requestPrompts?: Sign.DocumentPrompt[];
    showActivateControlModal: () => void;
}

interface ConnectedControlProps extends ControlProps{
    selectedSignatureId?: number;
    selectedInitialId?: number;
    setActiveSignControl: (payload: Sign.Actions.SetActiveSignControlPayload) => void;
    activeSignControl: Sign.SignControl;
    hasSignature: boolean;
    hasInitial: boolean;
    hasDate: boolean;
    hasText: boolean;
    hasPrompt: boolean;
    hasRecipients: boolean;
    showInviteModal: (payload: Sign.Actions.ShowInviteModalPayload) => void;
    overlayDefaults: Sign.OverlayDefaults;
    nextInvalidOverlay?: string;
    reject: () => void;
    saveStatus: Sign.DownloadStatus;

    activateNone: () => void;
    activateSignature: () => void;
    activateInitial: () => void;
    activateDate: () => void;
    activateText: () => void;
    activatePrompt: () => void;

    sign: () => void;
    getNextPrompt: () => Sign.DocumentPrompt;

    isButtonActive: { [key: string]: boolean };
}

class UnconnectedControls extends React.PureComponent<ConnectedControlProps> {
    constructor(props: ConnectedControlProps) {
        super(props);
        this.showInviteModal = this.showInviteModal.bind(this);
        this.sign = this.sign.bind(this);
        this.nextPrompt = this.nextPrompt.bind(this);
    }

    sign() {
        if (this.props.nextInvalidOverlay) {
            this.scrollTo(this.props.nextInvalidOverlay);
        }
        else {
            this.props.sign();
        }
    }

    nextPrompt() {
        const prompt = this.props.getNextPrompt();
        this.scrollTo(prompt.promptIndex);
    }

    showInviteModal() {
        this.props.showInviteModal({ documentSetId: this.props.documentSetId });
    }

    scrollTo(id: string) {
        Scroll.scrollTo(`overlay-${id}`, {smooth: true, duration: 350, offset: -233})
    }

    render() {
        const { hasSignature, hasInitial, hasDate, hasText, hasPrompt, hasRecipients }  = this.props;
        const hasSigned = ( hasSignature || hasInitial || hasDate || hasText);
        const selfSign = hasSigned && !hasPrompt && !hasRecipients;
        const otherSign = !hasSigned && hasRecipients;
        const mixSign = hasSigned && hasRecipients;
        let submitString = 'Sign';
        if(otherSign){
            submitString = 'Send';
        }
        else if(mixSign){
            submitString = 'Sign & Send';
        }
        const nextPrompt = this.props.getNextPrompt();

        const canSubmit = hasSigned || hasRecipients;
        const saveIcon = {
            [Sign.DownloadStatus.InProgress]: 'fa-spin fa-spinner fa-3x fa-fw',
            [Sign.DownloadStatus.Stale]: 'stale-save fa-save',
            [Sign.DownloadStatus.Complete]: 'fa-save'
        }[this.props.saveStatus] || 'fa-save';
        const saveText = {
            [Sign.DownloadStatus.Complete]: 'Saved',
            [Sign.DownloadStatus.InProgress]: 'Saving',
        }[this.props.saveStatus] || 'Save Draft';

        const isButtonActive = this.props.isButtonActive;

        return (
            <div className="controls" onClick={this.props.activateNone}>
                <div className="container">
                    <div className="controls-left">
                        <ConditionalTooltip condition={!this.props.selectedSignatureId} delay={this.props.hasSignature ? 0 : 750} tooltip={this.props.hasSignature ? SignatureTooltip() : SignatureDragTooltip()}>
                            <DraggableAddSignatureControl signatureId={this.props.selectedSignatureId}  defaults={this.props.overlayDefaults.signature}>
                                <div className="draggable">
                                    <SignatureButton
                                        active={this.props.isButtonActive[Sign.SignControl.SIGNATURE]}
                                        setActive={this.props.activateSignature} />
                                </div>
                            </DraggableAddSignatureControl>
                        </ConditionalTooltip>

                        <ConditionalTooltip condition={!this.props.selectedInitialId} delay={this.props.hasInitial ? 0 : 750} tooltip={this.props.hasInitial ? InitialTooltip() : InitialDragTooltip()}>
                            <DraggableAddSignatureControl signatureId={this.props.selectedInitialId} defaults={this.props.overlayDefaults.signature}>
                                <div className="draggable">
                                    <InitialButton
                                        active={this.props.isButtonActive[Sign.SignControl.INITIAL]}
                                        setActive={this.props.activateInitial} />
                                </div>
                            </DraggableAddSignatureControl>
                        </ConditionalTooltip>

                        <ConditionalTooltip condition={!this.props.hasDate} tooltip={DateTooltip()}>
                            <DraggableAddDateControl defaults={this.props.overlayDefaults.date}>
                                <div className="draggable">
                                    <DateButton
                                        active={this.props.isButtonActive[Sign.SignControl.DATE]}
                                        setActive={this.props.activateDate} />
                                </div>
                            </DraggableAddDateControl>
                        </ConditionalTooltip>
                        
                        <ConditionalTooltip condition={!this.props.hasText} tooltip={TextTooltip()}>
                            <DraggableAddTextControl defaults={this.props.overlayDefaults.text}>
                                <div className="draggable">
                                    <TextButton active={this.props.isButtonActive[Sign.SignControl.TEXT]} setActive={this.props.activateText} />
                                </div>
                            </DraggableAddTextControl>
                        </ConditionalTooltip>

                        {this.props.showPrompts &&
                            <ConditionalTooltip condition={!this.props.hasPrompt} tooltip={PromptTooltip()}>
                                <DraggableAddPromptControl defaults={this.props.overlayDefaults.prompt}>
                                    <div className="draggable">
                                        <PromptButton active={this.props.isButtonActive[Sign.SignControl.PROMPT]} setActive={this.props.activatePrompt} />
                                    </div>
                                </DraggableAddPromptControl>
                            </ConditionalTooltip>
                        }
                    </div>

                    <div className="controls-right">
                        <ControlButton label="Select Control" iconName="fa-bars" classNames="visible-mobile visible-mobile-only" onClick={this.props.showActivateControlModal} />
                        <ControlButton label={saveText} iconName={saveIcon} onClick={this.props.save} visible={this.props.showSave} />
                        <ControlButton label="Invite" iconName="fa-users" onClick={this.showInviteModal} visible={this.props.showInvite} />
                        <ControlButton label="Guide" iconName="fa-forward" onClick={this.nextPrompt} visible={!!nextPrompt} />
                        <ControlButton label="Reject" iconName="fa-times" onClick={this.props.reject} visible={this.props.showReject && false} />
                        <ControlButton label={submitString} iconName="fa-pencil" classNames={`submit-button visible-mobile ${canSubmit ? '' : 'submit-disabled'}`} onClick={this.sign} />
                    </div>
                </div>
            </div>
        );
    }
}

interface ControlButtonProps {
    label: string;
    iconName: string;
    classNames?: string;
    visible?: boolean;
    onClick: React.EventHandler<React.MouseEvent<HTMLDivElement>>;
}

class ControlButton extends React.PureComponent<ControlButtonProps> {
    render() {
        const visible = this.props.visible === undefined ? true : this.props.visible;
        
        if (!visible) {
            return false;
        }

        return (
            <div className={`sign-control ${this.props.classNames || ''}`} onClick={this.props.onClick}>
                <div className="button-text">
                    <i className={`fa ${this.props.iconName}`} />
                    <span className="label">{this.props.label}</span>
                </div>
            </div>
        );
    }
}

function validPrompt(prompt : Sign.DocumentPrompt){
    return prompt.value && prompt.value.recipientEmail;
}


function findNextOverlay(positionables: Sign.DocumentPrompt[]){
    return positionables.sort(function (a, b) {
      return a.pageNumber - b.pageNumber || a.offsetY- b.offsetY;
    })[0].promptIndex
}

function findNextInvalidOverlay(documentViewer: Sign.DocumentViewer, documentId: string) {
    const invalidPrompts = Object.keys(documentViewer.prompts).map((k: string) => {
        if(documentViewer.prompts[k].documentId === documentId){
            if(!validPrompt(documentViewer.prompts[k])){
                return documentViewer.prompts[k];
            }
        }
    }).filter(d => !!d);
    if(invalidPrompts.length){
        return findNextOverlay(invalidPrompts)
    }
    return;
}


export const Controls = connect<{}, {}, ControlProps>(
    (state: Sign.State, ownProps: ControlProps) => {
        const nextInvalidOverlay = findNextInvalidOverlay(state.documentViewer, ownProps.documentId);

        const activeSignControl = state.documentViewer.activeSignControl;

        const hasSignature = !!Object.keys(state.documentViewer.signatures).length;
        const hasInitial = !!Object.keys(state.documentViewer.signatures).length;
        const hasDate = !!Object.keys(state.documentViewer.dates).length;
        const hasText = !!Object.keys(state.documentViewer.texts).length;
        const hasPrompt = !!Object.keys(state.documentViewer.prompts).length;
        const hasRecipients = ((state.documentSets[ownProps.documentSetId] || {recipients: []}).recipients || []).length > 0;

        function sign() {
            const hasSigned = ( hasSignature || hasInitial || hasDate || hasText);
            const selfSign = (hasSigned && !hasPrompt && !hasRecipients) || ownProps.requestedSignatureInfo; ;
            const otherSign = !hasSigned && hasRecipients;
            const mixSign = hasSigned && hasRecipients;

            if (selfSign) {
                ownProps.sign();
            }
            else {
                ownProps.send();
            }
        }

        function getNextPrompt() {
            return ownProps.requestPrompts && ownProps.requestPrompts[0];
        }


        const isButtonActive = {
            [Sign.SignControl.SIGNATURE]: activeSignControl === Sign.SignControl.SIGNATURE,
            [Sign.SignControl.INITIAL]: activeSignControl === Sign.SignControl.INITIAL,
            [Sign.SignControl.DATE]: activeSignControl === Sign.SignControl.DATE,
            [Sign.SignControl.TEXT]: activeSignControl === Sign.SignControl.TEXT,
        }

        return {
            selectedSignatureId: state.documentViewer.selectedSignatureId,
            selectedInitialId: state.documentViewer.selectedInitialId,
            activeSignControl,
            
            hasSignature, hasInitial, hasDate, hasText, hasPrompt, hasRecipients,

            isButtonActive,

            
            overlayDefaults: state.overlayDefaults,
            nextInvalidOverlay,
            saveStatus: state.documentViewer.saveStatus,

            sign, getNextPrompt
        }
    },
    {
        setActiveSignControl,
        showInviteModal,
        reject: showRejectConfirmationModal,
        showActivateControlModal,

        activateNone: () => setActiveSignControl({ activeSignControl: Sign.SignControl.NONE }),
        activateSignature: () => setActiveSignControl({ activeSignControl: Sign.SignControl.SIGNATURE }),
        activateInitial: () => setActiveSignControl({ activeSignControl: Sign.SignControl.INITIAL }),
        activateDate: () => setActiveSignControl({ activeSignControl: Sign.SignControl.DATE }),
        activateText: () => setActiveSignControl({ activeSignControl: Sign.SignControl.TEXT }),
        activatePrompt: () => setActiveSignControl({ activeSignControl: Sign.SignControl.PROMPT }),
    }
)(UnconnectedControls)