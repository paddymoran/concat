import * as React from 'react';
import { DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Signature from './signature';

interface SignatureDragContainerProps {
    signatures: Sign.DocumentSignature[];
    className?: string;
}

export default class SignatureDragContainer extends React.Component<SignatureDragContainerProps> {
    render() {

        return (
            <div className={this.props.className || ''} ref='container'>
                {this.props.signatures.map((signature, index) => <Signature key={index} signatureIndex={index} ref='signature' />)}
                {this.props.children}
            </div>
        );
    }
}
