import * as React from 'react';
import { DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Signature from './signature';

interface SignatureDragContainerProps {
    signatures: Sign.DocumentSignatures;
    className?: string;
}

export default class SignatureDragContainer extends React.Component<SignatureDragContainerProps> {
    render() {
        return (
            <div className={this.props.className || ''} ref='container'>
                {Object.keys(this.props.signatures).map(key => <Signature key={key} signatureIndex={key} />)}
                {this.props.children}
            </div>
        );
    }
}
