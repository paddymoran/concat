import * as React from 'react';
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

export default class Signature extends React.Component<SignatureProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            width: 400,
            height: 160
        }
    }

    onResize(direction, styleSize, clientSize, delta, newPos) {
        const { signature } = this.refs;
        console.log(signature);
        console.log(signature.offsetWidth);
        console.log(signature.offsetHeight);

        this.setState({
            width: signature.offsetWidth,
            height: signature.offsetHeight
        });
    }

    position() {
        const { signature } = this.refs;

        if (!signature) {
            throw new Error('Signature does not exist');
        }

        console.log(signature);
        console.log(signature.width);
        console.log(signature.height);

        return {
            x: signature.state.x,
            y: signature.state.y,
            width: this.state.width,
            height: this.state.height
        }
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
                ref='signature'
                initial={{
                    x: 0,
                    y: 0,
                    width: this.state.width,
                    height: this.state.height
                }}
                style={style}
                minWidth={200}
                maxWidth={800}
                bounds={'parent'}
                resizerHandleStyle={handleStyles}
                lockAspectRatio={true}
                onResize={this.onResize.bind(this)}
            >
                <img src={'signatures/' + this.props.signatureId} style={{width: '100%'}} draggable="false" />
            </ReactRnd>
        );
    }
}
