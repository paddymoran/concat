import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource } from 'react-dnd';
import ReactRnd from 'react-rnd';
import { moveSignature, removeSignatureFromDocument } from '../actions';
import { connect } from 'react-redux';

interface ConnectedSignatureProps {
    signatureIndex: string;
    page: React.ReactInstance;
}

interface SignatureProps extends ConnectedSignatureProps {
    signature: Sign.DocumentSignature;
    removeSignatureFromDocument: (payload: Sign.Actions.RemoveSignatureFromDocumentPayload) => void;
    moveSignature: (payload: Sign.Actions.MoveSignaturePayload) => void;
}

interface SignatureState {
    yOffset: number;
}

const style = {
    border: '1px dashed black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const handleStyles = {
    bottomRight: {
        background: 'black',
        position: 'absolute',
        width: '20px',
        height: '20px',
        right: '-10px',
        bottom: '-10px',
        cursor: 'nw-resize',
    }
};

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

    constructor(props: SignatureProps) {
        super(props);

        this.state = {
            yOffset: (props.signature.heightRatio / 2) + 1
        };

        this.onMove = this.onMove.bind(this);
        this.onResize = this.onResize.bind(this);
    }

    /**
     * On mount, save the size of the signature.
     * We don't know it in the reducer when the signature is created, so we have to set it here.
     */
    componentDidMount() {
        const pageSize = this.getPageSize();
        const signatureDOMNode = findDOMNode(this.signature);

        this.props.moveSignature({
            signatureIndex: this.props.signatureIndex,
            widthRatio: boundNumber(signatureDOMNode.clientWidth / pageSize.width),
            heightRatio: boundNumber(signatureDOMNode.clientHeight / pageSize.height)
        });
    }

    /**
     * Move signature to where we think it should be, everytime the component updates.
     */
    componentDidUpdate() {
        const pageSize = this.getPageSize();

        this.signature.updateSize({
            width: this.props.signature.widthRatio * pageSize.width,
            height: this.props.signature.heightRatio * pageSize.height
        });

        this.signature.updatePosition({
            x: this.props.signature.xRatio * pageSize.width,
            y: this.props.signature.yRatio * pageSize.height
        });
    }

    getPageSize() {
        const pageDOMNode = findDOMNode(this.props.page);

        return {
            width: pageDOMNode.clientWidth,
            height: pageDOMNode.clientHeight
        };
    }

    onMove(event: ReactRnd.DraggableData, resizeData: ReactRnd.ResizeData) {
        const pageSize = this.getPageSize();

        const xRatio = resizeData.x / pageSize.width;

        this.props.moveSignature({
            signatureIndex: this.props.signatureIndex,
            xRatio: boundNumber(resizeData.x / pageSize.width),
            yRatio: boundNumber(resizeData.y / pageSize.height)
        });
    }

    onResize(event: any, resizeDirection: string, element: any) {
        const pageSize = this.getPageSize();

        const newWidth = element.clientWidth;
        const newHeight = element.clientHeight;

        let moveData: Sign.Actions.MoveSignaturePayload = {
            signatureIndex: this.props.signatureIndex,
            widthRatio: boundNumber(newWidth / pageSize.width),
            heightRatio: boundNumber(newHeight / pageSize.height)
        };

        // If the signature has been resized from the top, it now has a new Y position
        if (resizeDirection === 'top' || resizeDirection === 'topLeft' || resizeDirection === 'topRight') {
            // Get the old height and Y position
            const oldHeight = this.props.signature.heightRatio * pageSize.height;
            const oldYPosition = this.props.signature.yRatio * pageSize.height;

            // Figure out the new Y position === <old Y position> + <change in height>
            const newYPosition = oldYPosition + (oldHeight - newHeight);
            
            // Add the new Y ratio to the move signature action
            moveData.yRatio = boundNumber(newYPosition / pageSize.height);
        }

        // If the signature has been sized from the left, it now has a new X position
        if (resizeDirection === 'left' || resizeDirection === 'topLeft' || resizeDirection === 'bottomLeft') {
            // Get the old width and X position
            const oldWidth = this.props.signature.widthRatio * pageSize.width;
            const oldXPosition = this.props.signature.xRatio * pageSize.width;

            // Figure out the new X position === <old X position> + <change in width>
            const newXPosition = oldXPosition + (oldWidth - newWidth);

            // Add the new X ratio to the move signature action
            moveData.xRatio = boundNumber(newXPosition / pageSize.width);
        }

        // Move that bus! (eeer.... I mean that signature)
        this.props.moveSignature(moveData);
    }

    render() {
        const { signature } = this.props;
        const defaults = {
            x: 0,
            y: 0,
            width: 200,
            height: 100
        };

        const stylesWithbackground = {
            ...style,
            background: `url("/api/signatures/${this.props.signature.signatureId}"`,
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
                resizeHandlerStyles={handleStyles}
            ><button onClick={() => this.props.removeSignatureFromDocument({ signatureIndex: this.props.signatureIndex })}>x</button></ReactRnd>
        );
    }
}

export default connect(
    (state: Sign.State, ownProps: ConnectedSignatureProps) => ({
        signature: state.documentViewer.signatures[ownProps.signatureIndex]
    }),
    { removeSignatureFromDocument, moveSignature }
)(Signature);