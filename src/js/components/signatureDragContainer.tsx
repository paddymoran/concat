import * as React from 'react';
import { DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Signature from './signature';

interface SignatureDragContainerProps {
    signatures: Sign.DocumentSignature[];
    className?: string;
}

export default class SignatureDragContainer extends React.Component<SignatureDragContainerProps> {
    relativeSignaturePosition() {
        const signature = this.refs.signature as Signature;
        const container = this.refs.container as HTMLElement;
        
        if (!signature) {
            throw new Error('Signature does not exist');
        }

        const signaturePosition = signature.position();
        const sizeRatio = (size: number, input: number) => { return (1 / size) * input }

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
                {this.props.signatures.map((signature, index) => <Signature key={index} signatureId={signature.signatureId} ref='signature' />)}
                {this.props.children}
            </div>
        );
    }
}
