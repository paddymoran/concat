import * as React from 'react';
import { findDOMNode } from 'react-dom';
import ReactRnd from 'react-rnd';
import { moveSignature, removeSignatureFromDocument } from '../actions';
import { connect } from 'react-redux';
import { signatureUrl } from '../utils';

interface ConnectedSignatureProps {
    signatureIndex: string;
    page: React.ReactInstance;
    containerHeight: number;
    containerWidth: number;
}

interface SignatureProps extends ConnectedSignatureProps {
    signature: Sign.DocumentSignature;
    removeSignatureFromDocument: (payload: Sign.Actions.RemoveSignatureFromDocumentPayload) => void;
    moveSignature: (payload: Sign.Actions.MoveSignaturePayload) => void;
}

interface SignatureState {
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

class Signature extends React.PureComponent<SignatureProps, SignatureState> {
    private signature: ReactRnd;

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


    constructor(props: SignatureProps) {
        super(props);

        this.state = {
            yOffset: (props.signature.ratioY / 2) + 1,
        };

        this.onMove = this.onMove.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onDelete = this.onDelete.bind(this);
    }

    /**
     * On mount, save the size of the signature.
     * We don't know it in the reducer when the signature is created, so we have to set it here.
     */
    componentDidMount() {

        const signatureDOMNode = findDOMNode(this.signature);
        this.props.moveSignature({
            signatureIndex: this.props.signatureIndex,
            ratioX: boundNumber(signatureDOMNode.clientWidth / this.props.containerWidth),
            ratioY: boundNumber(signatureDOMNode.clientHeight / this.props.containerHeight)
        });
    }

    /**
     * Move signature to where we think it should be, everytime the component updates.
     */
    componentDidUpdate() {

        this.signature.updateSize({
            width: this.props.signature.ratioX * this.props.containerWidth,
            height: this.props.signature.ratioY * this.props.containerHeight
        });

        this.signature.updatePosition({
            x: this.props.signature.offsetX * this.props.containerWidth,
            y: this.props.signature.offsetY * this.props.containerHeight
        });
    }



    onMove(event: ReactRnd.DraggableData, resizeData: ReactRnd.ResizeData) {

        const xRatio = resizeData.x / this.props.containerWidth;

        this.props.moveSignature({
            signatureIndex: this.props.signatureIndex,
            offsetX: boundNumber(resizeData.x / this.props.containerWidth),
            offsetY: boundNumber(resizeData.y / this.props.containerHeight)
        });
    }

    onResize(event: any, resizeDirection: string, element: any) {


        const newWidth = element.clientWidth;
        const newHeight = element.clientHeight;

        let moveData: Sign.Actions.MoveSignaturePayload = {
            signatureIndex: this.props.signatureIndex,
            ratioX: boundNumber(newWidth / this.props.containerWidth),
            ratioY: boundNumber(newHeight / this.props.containerHeight)
        };

        // If the signature has been resized from the top, it now has a new Y position
        if (resizeDirection === 'top' || resizeDirection === 'topLeft' || resizeDirection === 'topRight') {
            // Get the old height and Y position
            const oldHeight = this.props.signature.ratioY * this.props.containerHeight;
            const oldYPosition = this.props.signature.offsetY * this.props.containerHeight;

            // Figure out the new Y position === <old Y position> + <change in height>
            const newYPosition = oldYPosition + (oldHeight - newHeight);

            // Add the new Y ratio to the move signature action
            moveData.offsetY = boundNumber(newYPosition / this.props.containerHeight);
        }

        // If the signature has been sized from the left, it now has a new X position
        if (resizeDirection === 'left' || resizeDirection === 'topLeft' || resizeDirection === 'bottomLeft') {
            // Get the old width and X position
            const oldWidth = this.props.signature.ratioX * this.props.containerWidth;
            const oldXPosition = this.props.signature.offsetX * this.props.containerWidth;

            // Figure out the new X position === <old X position> + <change in width>
            const newXPosition = oldXPosition + (oldWidth - newWidth);

            // Add the new X ratio to the move signature action
            moveData.offsetX = boundNumber(newXPosition / this.props.containerWidth);
        }

        // Move that bus! (eeer.... I mean that signature)
        this.props.moveSignature(moveData);
    }

    onDelete() {
        this.props.removeSignatureFromDocument({ signatureIndex: this.props.signatureIndex })
    }

    render() {
        const { signature } = this.props;
        const defaults = {
            x: 0,
            y: 0,
            width: Sign.DefaultSignatureSize.WIDTH,
            height: Sign.DefaultSignatureSize.WIDTH / this.props.signature.xyRatio
        };

        const stylesWithbackground = {
            background: `url("${signatureUrl(this.props.signature.signatureId)}"`,
            backgroundSize: '100% 100%', // Must come after background
        };

        return (
            <ReactRnd
                ref={(ref: ReactRnd) => this.signature = ref as ReactRnd}
                default={defaults}
                style={stylesWithbackground}
                onDragStop={this.onMove}
                onResizeStop={this.onResize}
                bounds="parent"
                minWidth={Signature.MIN_WIDTH}
                minHeight={Signature.MIN_HEIGHT}
                lockAspectRatio={true}
                resizeHandlerClasses={Signature.HANDLER_STYLES}
            ><button className="button-no-style signature-destroy" onClick={this.onDelete}><span className="fa fa-trash-o"/></button></ReactRnd>
        );
    }
}

export default connect(
    (state: Sign.State, ownProps: ConnectedSignatureProps) => ({
        signature: state.documentViewer.signatures[ownProps.signatureIndex]
    }),
    { removeSignatureFromDocument, moveSignature }
)(Signature);