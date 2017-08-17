import * as React from 'react';
import { findDOMNode } from 'react-dom';
import ReactRnd from 'react-rnd';
import {
    moveSignature, removeSignatureFromDocument,
    moveDate, removeDateFromDocument
 } from '../actions';
import { connect } from 'react-redux';
import { signatureUrl, stringToCanvas } from '../utils';

interface ConnectedPositionableProps {
    [this.props.indexKey]: string;
    page: React.ReactInstance;
    containerHeight: number;
    containerWidth: number;
}

interface PositionableProps extends ConnectedPositionableProps {
    positionable: Sign.DocumentSignature;
    removeSignatureFromDocument: (payload: Sign.Actions.RemoveSignatureFromDocumentPayload) => void;
    moveSignature: (payload: Sign.Actions.MoveSignaturePayload) => void;
}

interface PositionableState {
    yOffset: number;
}



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

class Positionable extends React.PureComponent<PositionableProps, PositionableState> {
    private positionable: ReactRnd;

    public static MIN_WIDTH = 50;
    public static MIN_HEIGHT = 25;

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


    constructor(props: PositionableProps) {
        super(props);
        this.state = {
            yOffset: (props.positionable.ratioY / 2) + 1,
        };

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
            [this.props.indexKey]: this.props[this.props.indexKey],
            offsetX: boundNumber(resizeData.x / this.props.containerWidth),
            offsetY: boundNumber(resizeData.y / this.props.containerHeight)
        });
    }

    onResize(event: any, resizeDirection: string, element: any) {


        const newWidth = element.clientWidth;
        const newHeight = element.clientHeight;

        let moveData: Sign.Actions.MovePositionablePayload = {
            [this.props.indexKey]: this.props[this.props.indexKey],
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
        if(this.props.resize) {
            moveData = {...moveData, ...this.props.resize(this.props.positionable, newWidth, newHeight)}
        }
        // Move that bus! (eeer.... I mean that positionable)
        this.props.movePositionable(moveData);
    }

    onDelete() {
        this.props.removePositionableFromDocument({ [this.props.indexKey]: this.props[this.props.indexKey] })
    }

    render() {

        const { positionable, containerWidth, containerHeight } = this.props;
        const defaults = {
            x: containerWidth * positionable.offsetX,
            y: containerHeight * positionable.offsetY,
            width: containerWidth * positionable.ratioX,
            height: containerHeight * positionable.ratioY
        };

        const stylesWithbackground = {
            backgroundImage: this.props.background,
            backgroundSize: '100% 100%', // Must come after background
        };

        return (
            <ReactRnd
                ref={(ref: ReactRnd) => this.positionable = ref as ReactRnd}
                default={defaults}
                style={stylesWithbackground}
                onDragStop={this.onMove}
                onResizeStop={this.onResize}
                bounds="parent"
                minWidth={Positionable.MIN_WIDTH}
                minHeight={Positionable.MIN_HEIGHT}
                lockAspectRatio={true}
                resizeHandlerClasses={Positionable.HANDLER_STYLES}
            ><button className="button-no-style signature-destroy" onClick={this.onDelete}><span className="fa fa-trash-o"/></button></ReactRnd>
        );
    }
}

export const SignaturePositionable = connect(
    (state: Sign.State, ownProps: ConnectedSignatureProps) => ({
        positionable: state.documentViewer.signatures[ownProps.signatureIndex],
        indexKey: 'signatureIndex',
        background: `url("${signatureUrl(ownProps.positionable.signatureId)}"`
    }),
    { removePositionableFromDocument: removeSignatureFromDocument, movePositionable: moveSignature }
)(Positionable);


export const DatePositionable = connect(
    (state: Sign.State, ownProps: ConnectedSignatureProps) => ({
        positionable: state.documentViewer.dates[ownProps.dateIndex]
        indexKey: 'dateIndex',
        background: `url("${state.documentViewer.dates[ownProps.dateIndex].dataUrl}")`,
        resize: (positionable, width, height) => {
            const canvas = stringToCanvas(height, positionable.value);
            return {dataUrl: canvas.toDataURL()}
        }
    }),
    { removePositionableFromDocument: removeDateFromDocument, movePositionable: moveDate }
)(Positionable);