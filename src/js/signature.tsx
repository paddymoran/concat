import * as React from 'react';
import { findDOMNode } from "react-dom";
import { DragSource } from 'react-dnd';
const ReactRnd = require('react-rnd');

interface SignatureProps {
    signatureId: string;
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

export default class Signature extends React.Component<SignatureProps, any> {
    constructor(props) {
        super(props);
    }

    position() {
        const { signature } = this.refs;

        if (!signature) {
            throw new Error('Signature does not exist');
        }

        const signatureNode = findDOMNode(signature);

        return {
            x: signature.state.x,
            y: signature.state.y,
            width: signatureNode.offsetWidth,
            height: signatureNode.offsetHeight
        }
    }

    render() {
        return (
            <ReactRnd
                ref='signature'
                initial={{
                    x: 0,
                    y: 0,
                    width: 400,
                    height: 160
                }}
                style={style}
                minWidth={200}
                maxWidth={800}
                bounds={'parent'}
                resizerHandleStyle={handleStyles}
                lockAspectRatio={true}
            >
                <img src={'signatures/' + this.props.signatureId} style={{width: '100%'}} draggable="false" />
            </ReactRnd>
        );
    }
}
