import * as React from 'react';
import { DragSource } from 'react-dnd';
const ReactRnd = require('react-rnd');

interface SignatureProps {
    signatureId: string;
}

const style = {
    border: '1px solid black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

export default class Signature extends React.Component<SignatureProps, any> {
    constructor(props) {
        super(props);
    }

    render() {
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
        return (
            <ReactRnd
                initial={{
                    x: window.innerWidth / 2 - 200,
                    y: window.innerHeight / 2 - 80,
                    width: 400,
                    height: 160,
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
