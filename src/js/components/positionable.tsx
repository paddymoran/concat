import * as React from 'react';
import { findDOMNode } from 'react-dom';
import ReactRnd from 'react-rnd';
import {
    moveSignature, removeSignatureFromDocument,
    moveDate, removeDateFromDocument,
    moveText, removeTextFromDocument,
    movePrompt, removePromptFromDocument
 } from '../actions';
import { connect } from 'react-redux';
import { signatureUrl, stringToCanvas, promptToCanvas } from '../utils';
import * as Calendar from 'react-widgets/lib/Calendar';
import * as Popover from 'react-bootstrap/lib/Popover'
import * as OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import * as Moment from 'moment';
import { debounce } from '../utils';

const DATE_FORMATS = [
    'DD MMMM YYYY',
    'DD-MM-YY',
    'DD/MM/YY',
    'YYYY/MM/DD'

]


interface PositionableProps {
    page: React.ReactInstance;
    containerHeight: number;
    containerWidth: number;
    index: string;
    documentSetId: string;
    documentId: string;
}

interface ConnectedPositionableProps extends PositionableProps {
    indexKey: string;
    positionable: Sign.Positionable | Sign.DocumentText | Sign.DocumentDate | Sign.DocumentPrompt,
    background?: string;
    removePositionableFromDocument: (payload: Sign.Actions.RemovePositionableFromDocumentPayload) => void;
    movePositionable: (payload: Sign.Actions.MovePositionablePayload | Sign.Actions.MoveDatePayload) => void;
    controls: React.ComponentClass<ControlProps>;
    rerenderOnResize?: boolean;
    recipients?: Sign.Recipients;
    className: string;
}

interface ControlProps {
    index: string;
    onDelete: () => void;
    element: () => React.Component;
    containerWidth: number;
    documentSetId: string;
    documentId: string;
}

interface DateControlProps extends ControlProps{
    date: Sign.DocumentDate,
    updateDate: (payload: Sign.Actions.MoveDatePayload) => void;
}

interface TextControlProps extends ControlProps{
    text: Sign.DocumentText,
    updateText: (payload: Sign.Actions.MoveTextPayload) => void;
}

interface PromptControlProps extends ControlProps{
    prompt: Sign.DocumentPrompt,
    updatePrompt: (payload: Sign.Actions.MovePromptPayload) => void;
    recipients: Sign.Recipients;
}


class SimpleControls extends React.PureComponent<ControlProps> {
    render(){
        return <div className="positionable-controls">
            <button className="button-no-style signature-destroy" onClick={this.props.onDelete}><span className="fa fa-trash-o"/></button>
        </div>
    }
}


class DateControls extends React.PureComponent<DateControlProps> {
    constructor(props: DateControlProps){
        super(props);
        this.onChangeDate = this.onChangeDate.bind(this);
        this.onChangeFormat= this.onChangeFormat.bind(this);
    }

    onChangeDate(newValue : Date) {
        const timestamp = newValue.getTime();
        const value = Moment(newValue).format(this.props.date.format);
        const height = findDOMNode(this.props.element() as React.Component).clientHeight;
        const canvas = stringToCanvas(height, value);
        const { documentId, format } = this.props.date;
        const width = canvas.width;
        const ratioX = width / this.props.containerWidth;
        this.props.updateDate({
            dateIndex: this.props.index,
            format,
            timestamp,
            height,
            value,
            ratioX
        })
    }
    onChangeFormat(event : React.FormEvent<HTMLSelectElement>) {
        const { documentId, timestamp } = this.props.date;
        const format = event.currentTarget.value;
        const value = Moment(this.props.date.timestamp).format(format);
        const height = findDOMNode(this.props.element() as React.Component).clientHeight;
        const canvas = stringToCanvas(height, value);
        const width = canvas.width;
        const ratioX = width / this.props.containerWidth;
        this.props.updateDate({
            dateIndex: this.props.index,
            format,
            timestamp,
            height,
            value,
            ratioX
        });
    }

    render(){
        return <div className="positionable-controls">
             <OverlayTrigger  trigger="click" rootClose placement="top" overlay={
                <Popover id={`popover-for-${this.props.index}`} >
                    <Calendar value={new Date(this.props.date.timestamp)} onChange={this.onChangeDate}/>
                    <select className="form-control" value={this.props.date.format} onChange={this.onChangeFormat}>
                        { DATE_FORMATS.map((d, i) => {
                            return <option key={i} value={d}>{ d }</option>
                        }) }
                    </select>
                </Popover>
             }>
            <button className="button-no-style "><span className="fa fa-calendar"/></button>
            </OverlayTrigger>
            <button className="button-no-style" onClick={this.props.onDelete}><span className="fa fa-trash-o"/></button>
        </div>
    }
}


const ConnectedDateControls = connect((state, ownProps: ControlProps) => ({
    date: state.documentViewer.dates[ownProps.index]  as Sign.DocumentDate,
}), {
    updateDate: moveDate
})(DateControls)

class TextControls extends React.PureComponent<TextControlProps> {
    constructor(props: TextControlProps){
        super(props);
        this.onChangeValue = this.onChangeValue.bind(this);
    }

    onChangeValue(event : React.FormEvent<HTMLTextAreaElement>) {
        const value = event.currentTarget.value;
        const height = findDOMNode(this.props.element() as React.Component).clientHeight;
        const canvas = stringToCanvas(height, value, Sign.DefaultSignatureSize.MIN_WIDTH);
        const width = canvas.width;
        const ratioX = width / this.props.containerWidth;
        this.props.updateText({
            textIndex: this.props.index,
            height,
            value,
            ratioX
        });
    }

    render(){
        return <div className="positionable-controls">
             <OverlayTrigger  trigger="click" rootClose placement="top" overlay={
                    <Popover id={`popover-for-${this.props.index}`} >
                        <div className="form-group">
                            <textarea className="form-control" rows={2} value={this.props.text.value} onChange={this.onChangeValue}></textarea>
                        </div>
                    </Popover>
                 }>
                <button className="button-no-style "><span className="fa fa-font"/></button>
            </OverlayTrigger>
            <button className="button-no-style" onClick={this.props.onDelete}><span className="fa fa-trash-o"/></button>
        </div>
    }
}


const ConnectedTextControls = connect((state, ownProps: ControlProps) => ({
    text: state.documentViewer.texts[ownProps.index]  as Sign.DocumentText,
}), {
    updateText: moveText
})(TextControls)


class PromptControls extends React.PureComponent<PromptControlProps> {
    constructor(props: PromptControlProps){
        super(props);
        this.onChangeRecipient= this.onChangeRecipient.bind(this);
        this.onChangeType= this.onChangeType.bind(this);
    }

    onChangeRecipient(event : React.FormEvent<HTMLSelectElement>) {
        const value = event.currentTarget.value
        this.props.updatePrompt({
            promptIndex: this.props.index,
            value: {
                recipientEmail: value,
                type: this.props.prompt.value.type
            }
        });
    }

    onChangeType(event : React.FormEvent<HTMLSelectElement>) {
        const value = event.currentTarget.value as  Sign.PromptType;;
        this.props.updatePrompt({
            promptIndex: this.props.index,
            value: {
                recipientEmail: this.props.prompt.value.recipientEmail,
                type: value
            }
        });

    }

    render(){
        return <div className="positionable-controls">
             <OverlayTrigger  trigger="click" rootClose placement="top" overlay={
                    <Popover id={`popover-for-${this.props.index}`} className="prompt-controls">
                        <div className="form-group">
                            <label>Who</label>
                            <select className="form-control" value={this.props.prompt.value.recipientEmail} onChange={this.onChangeRecipient}>
                                <option value="">Please select recipient</option>
                                { this.props.recipients.map((recipient, i) => <option key={recipient.email} value={recipient.email}>{ recipient.name }</option> ) }
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select className="form-control" value={this.props.prompt.value.type} onChange={this.onChangeType}>
                                <option value="signature">Signature</option>
                                <option value="initial">Initial</option>
                                <option value="date">Date</option>
                                <option value="text">Text</option>
                            </select>
                        </div>
                    </Popover>
                 }>
                <button className="button-no-style "><span className="fa fa-edit"/></button>
            </OverlayTrigger>
            <button className="button-no-style" onClick={this.props.onDelete}><span className="fa fa-trash-o"/></button>
        </div>
    }
}


const ConnectedPromptControls = connect((state, ownProps: ControlProps) => {
    return {
        prompt: state.documentViewer.prompts[ownProps.index]  as Sign.DocumentPrompt,
        recipients: (state.documentSets[ownProps.documentSetId] || {recipients: []}).recipients || []
        }
    }, {
    updatePrompt: movePrompt
})(PromptControls)


// Keep numbers between 0 and 1
const boundNumber = (number: number) => {
    if (number < 0) {
        return 0
    }
    else if (number > 1) {
        return 1;
    }

    return number;
}

class Positionable extends React.PureComponent<ConnectedPositionableProps> {
    private positionable: ReactRnd;

    private static HANDLER_STYLES = {
      bottom: 'handler',
      bottomLeft: 'handler-corner',
      bottomRight: 'handler-corner',
      left: 'handler',
      right: 'handler',
      top: 'handler',
      topLeft: 'handler-corner',
      topRight: 'handler-corner'
    } ;


    constructor(props: ConnectedPositionableProps) {
        super(props);
        this.onMove = this.onMove.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onDelete = this.onDelete.bind(this);
    }


    /**
     * Move positionable to where we think it should be, everytime the component updates.
     */
    componentDidUpdate() {

        this.positionable.updateSize({
            width: this.props.positionable.ratioX * this.props.containerWidth,
            height: this.props.positionable.ratioY * this.props.containerHeight
        });

        this.positionable.updatePosition({
            x: this.props.positionable.offsetX * this.props.containerWidth,
            y: this.props.positionable.offsetY * this.props.containerHeight
        });
    }


    onMove(event: ReactRnd.DraggableData, resizeData: ReactRnd.ResizeData) {

        const xRatio = resizeData.x / this.props.containerWidth;

        this.props.movePositionable({
            [this.props.indexKey]: this.props.index,
            offsetX: boundNumber(resizeData.x / this.props.containerWidth),
            offsetY: boundNumber(resizeData.y / this.props.containerHeight)
        });
    }

    onResize(event: any, resizeDirection: string, element: any) {


        let newWidth = element.clientWidth;
        const newHeight = element.clientHeight;

        if(this.props.rerenderOnResize){
            const positionable = this.props.positionable as Sign.DocumentText;
            const canvas = stringToCanvas(newHeight, positionable.value, Sign.DefaultSignatureSize.MIN_WIDTH);
            const width = canvas.width;
            if(width < newWidth){
                newWidth = width;
            }
        }

        let moveData: Sign.Actions.MovePositionablePayload = {
            [this.props.indexKey]: this.props.index,
            ratioX: boundNumber(newWidth / this.props.containerWidth),
            ratioY: boundNumber(newHeight / this.props.containerHeight)
        };

        // If the signature has been resized from the top, it now has a new Y position
        if (resizeDirection === 'top' || resizeDirection === 'topLeft' || resizeDirection === 'topRight') {
            // Get the old height and Y position
            const oldHeight = this.props.positionable.ratioY * this.props.containerHeight;
            const oldYPosition = this.props.positionable.offsetY * this.props.containerHeight;

            // Figure out the new Y position === <old Y position> + <change in height>
            const newYPosition = oldYPosition + (oldHeight - newHeight);

            // Add the new Y ratio to the move positionable action
            moveData.offsetY = boundNumber(newYPosition / this.props.containerHeight);
        }

        // If the positionable has been sized from the left, it now has a new X position
        if (resizeDirection === 'left' || resizeDirection === 'topLeft' || resizeDirection === 'bottomLeft') {
            // Get the old width and X position
            const oldWidth = this.props.positionable.ratioX * this.props.containerWidth;
            const oldXPosition = this.props.positionable.offsetX * this.props.containerWidth;

            // Figure out the new X position === <old X position> + <change in width>
            const newXPosition = oldXPosition + (oldWidth - newWidth);

            // Add the new X ratio to the move positionable action
            moveData.offsetX = boundNumber(newXPosition / this.props.containerWidth);
        }
        // Move that bus! (eeer.... I mean that positionable)
        this.props.movePositionable(moveData);
    }

    onDelete() {
        this.props.removePositionableFromDocument({ [this.props.indexKey]: this.props.index })
    }

    render() {

        const { positionable, containerWidth, containerHeight, className } = this.props;
        const defaults = {
            x: containerWidth * positionable.offsetX,
            y: containerHeight * positionable.offsetY,
            width: containerWidth * positionable.ratioX,
            height: containerHeight * positionable.ratioY
        };

        const stylesWithbackground = this.props.background ? {
            backgroundImage: this.props.background,
            backgroundSize: '100% 100%',
        } : {};

        const Controls = this.props.controls as React.ComponentClass<ControlProps>;
        return (
            <ReactRnd
                ref={(ref: ReactRnd) => this.positionable = ref as ReactRnd}
                default={defaults}
                style={stylesWithbackground}
                onDragStop={this.onMove}
                onResizeStop={this.onResize}
                bounds="parent"
                minWidth={Sign.DefaultSignatureSize.MIN_WIDTH}
                minHeight={Sign.DefaultSignatureSize.MIN_HEIGHT}
                lockAspectRatio={true}
                resizeHandlerClasses={Positionable.HANDLER_STYLES}
                className={className}
            ><Controls onDelete={this.onDelete} index={this.props.index}
            element={() => this.positionable}
            containerWidth={containerWidth}
            documentSetId={this.props.documentSetId}
            documentId={this.props.documentId}/>
            <div id={`overlay-${this.props.index}`}/>
            </ReactRnd>
        );
    }
}




export const SignaturePositionable = connect<{}, {}, PositionableProps>(
    (state: Sign.State, ownProps: PositionableProps) => ({
        positionable: state.documentViewer.signatures[ownProps.index] as Sign.Positionable,
        indexKey: 'signatureIndex',
       background: `url("${signatureUrl(state.documentViewer.signatures[ownProps.index].signatureId)}"`,
        controls: SimpleControls,
        className: 'signature-positionable'
    }),
    { removePositionableFromDocument: removeSignatureFromDocument, movePositionable: moveSignature }
)(Positionable);


export const DatePositionable = connect<{}, {}, PositionableProps>(
    (state: Sign.State, ownProps: PositionableProps) => {
        const positionable : Sign.DocumentDate = state.documentViewer.dates[ownProps.index];
        const height = Math.round(ownProps.containerHeight * positionable.ratioY);
        const canvas = stringToCanvas(height, positionable.value, Sign.DefaultSignatureSize.MIN_WIDTH)
        const dataUrl = canvas.toDataURL();
        return {
            positionable,
            indexKey: 'dateIndex',
            background: `url("${dataUrl}")`,
            controls: ConnectedDateControls,
            rerenderOnResize: true,
            className: 'date-positionable'
        }
    },
    { removePositionableFromDocument: removeDateFromDocument, movePositionable: moveDate }
)(Positionable);



export const TextPositionable = connect<{}, {}, PositionableProps>(
    (state: Sign.State, ownProps: PositionableProps) => {
        const positionable : Sign.DocumentText = state.documentViewer.texts[ownProps.index];
        const height = Math.round(ownProps.containerHeight * positionable.ratioY);
        const canvas = stringToCanvas(height, positionable.value, Sign.DefaultSignatureSize.MIN_WIDTH)
        const dataUrl = canvas.toDataURL();
        return {
            positionable: state.documentViewer.texts[ownProps.index] as Sign.Positionable,
            indexKey: 'textIndex',
            background: `url("${dataUrl}")`,
            controls: ConnectedTextControls,
            rerenderOnResize: true,
            className: 'text-positionable'
        }
    },
    { removePositionableFromDocument: removeTextFromDocument, movePositionable: moveText }
)(Positionable);

export const PromptPositionable = connect<{}, {}, PositionableProps>(
    (state: Sign.State, ownProps: PositionableProps) => {
        const positionable : Sign.DocumentPrompt = state.documentViewer.prompts[ownProps.index];
        const width = Math.round(ownProps.containerWidth * positionable.ratioX);
        const height = Math.round(ownProps.containerHeight * positionable.ratioY);
        let recipients = [] as Sign.Recipients;
        if(state.documentSets[ownProps.documentSetId]){
             recipients = state.documentSets[ownProps.documentSetId].recipients || [] as Sign.Recipients;
        }
        const recipient = recipients.find((r: Sign.Recipient) => r.email === positionable.value.recipientEmail);
        const name = recipient ? recipient.name : 'Please select recipient';

        const type = positionable.value.type;
        const canvas = promptToCanvas(width, height, name, type, !recipient)
         const dataUrl = canvas.toDataURL();
        return {
            positionable: state.documentViewer.prompts[ownProps.index] as Sign.Positionable,
            indexKey: 'promptIndex',
            background: `url("${dataUrl}")`,
            controls: ConnectedPromptControls,
            className: 'prompt-positionable'
        }
    },
    { removePositionableFromDocument: removePromptFromDocument, movePositionable: movePrompt }
)(Positionable);