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
        let top = Math.round(item.top + delta.y);
        let left = Math.round(item.left + delta.x);

        top = top > 0 ? top : 0;
        left = left > 0 ? left : 0;
        left = left + component.state.width < styles.width ? left : styles.width - component.state.width;

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
            left: 0,
            width: 300
        };
    }

    moveBox(top, left) {
        this.setState({ top, left });
    }

    render() {
        return this.props.connectDropTarget(
            <div style={styles}>
                <Signature
                    signatureId={this.props.signatureId} />
            </div>
        );
    }
}
