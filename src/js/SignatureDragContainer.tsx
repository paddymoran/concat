import * as React from 'react';
import { DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Signature from './Signature.tsx';

interface SignatureDragContainerProps {
    signatureId: string;
}

const styles = {
    width: 800,
    height: 800,
    border: '1px solid black',
    position: 'relative'
};

const SignatureTarget = {
    drop(props, monitor, component) {
        const item = monitor.getItem();
        const delta = monitor.getDifferenceFromInitialOffset();
        const top = Math.round(item.top + delta.y);
        const left = Math.round(item.left + delta.x);

        component.moveBox(top, left);
    }
};

@DragDropContext(HTML5Backend)
@DropTarget("SIGNATURE", SignatureTarget, connect => ({
    connectDropTarget: connect.dropTarget()
}))
export default class SignatureDragContainer extends React.Component<SignatureDragContainerProps, any> {
    constructor(props) {
        super(props);

        this.state = {
            top: 0,
            left: 0
        };
    }

    moveBox(top, left) {
        this.setState({ top, left });
    }

    render() {
        const { connectDropTarget } = this.props;
        const { top, left } = this.state;

        return connectDropTarget(
            <div style={styles}>
                <Signature
                    left={left}
                    top={top}
                    signatureId='899cb186-38be-4e10-81ee-b6ed23634092' />
            });
            </div>
        );
    }
}
