import * as React from 'react';
import { findDOMNode } from "react-dom";
import { DragSource } from 'react-dnd';
import ReactRnd from 'react-rnd';
import { moveSignature } from '../actions';
import { connect } from 'react-redux';

interface ConnectedSignatureProps {
    signatureIndex: number;
}

interface SignatureProps extends ConnectedSignatureProps {
    moveSignature: (payload: Sign.Actions.MoveSignaturePayload) => void;
    signature: Sign.DocumentSignature;
}

const style = {
    border: '1px dashed black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const handleStyles = {
    bottomRight: {
        background: 'black',
        position: 'absolute',
        width: '20px',
        height: '20px',
        right: '-10px',
        bottom: '-10px',
        cursor: 'nw-resize'
    }
};

class Signature extends React.PureComponent<SignatureProps> {
    private signature: ReactRnd;

    position() {
        const signature: ReactRnd = this.signature;

        if (!signature) {
            throw new Error('Signature does not exist');
        }

        const signatureNode = findDOMNode(signature) as HTMLElement;

        return {
            x: signature.state.x,
            y: signature.state.y,
            width: signatureNode.offsetWidth,
            height: signatureNode.offsetHeight
        }
    }

    render() {
        const { signature } = this.props;
        return (
            <ReactRnd
                ref={(ref: ReactRnd) => this.signature = ref as ReactRnd}
                default={{
                    x: 0,
                    y: 0,
                    width: 400,
                    height: 160
                }}
                style={style}
                minWidth={200}
                maxWidth={800}
                onDragStop={(event) => this.props.moveSignature({ signatureIndex: this.props.signatureIndex, x: event.x, y: event.y })}
                bounds=".pdf-page"
                resizeHandlerStyles={handleStyles}
                lockAspectRatio={true}
            >
                <img src={'/api/signatures/' + this.props.signature.signatureId} style={{width: '100%'}} draggable={false} />
            </ReactRnd>
        );
    }
}

export default connect(
    (state: Sign.State, ownProps: ConnectedSignatureProps) => ({ signature: state.documentViewer.signatures[ownProps.signatureIndex] }),
    { moveSignature }
)(Signature);