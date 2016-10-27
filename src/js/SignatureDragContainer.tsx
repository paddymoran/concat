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

        const signaturePosition = signature.position();
        const sizeRatio = (size, input) => { return (1 / size) * input }

        return {
            x: sizeRatio(container.offsetWidth, signaturePosition.x),
            y: sizeRatio(container.offsetHeight, signaturePosition.y),
            width: sizeRatio(container.offsetWidth, signaturePosition.width),
            height: sizeRatio(container.offsetHeight, signaturePosition.height),
        }
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
