import * as React from 'react';
import { DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Signature from './Signature.tsx';

interface SignatureDragContainerProps {
    signatureId?: string;
    className?: string;
}



export default class SignatureDragContainer extends React.Component<SignatureDragContainerProps, any> {
    constructor(props) {
        super(props);
    }

    relativeSignaturePosition() {
        const { signature, container } = this.refs;
        
        if (!signature) {
            throw new Error('Signature does not exist');
        }

        let signaturePosition = signature.position();

        console.log(signaturePosition);

        return {
            x: this.relativePosition(container.offsetWidth, signaturePosition.x),
            y: this.relativePosition(container.offsetHeight, signaturePosition.y)
        }
    }

    relativePosition(size, position) {
        return (1 / size) * position;
    }

    render() {

        return (
            <div className={this.props.className || ''} ref='container'>
                {this.props.signatureId &&
                    <Signature signatureId={this.props.signatureId} ref='signature' />
                }
                {this.props.children}
            </div>
        );
    }
}
