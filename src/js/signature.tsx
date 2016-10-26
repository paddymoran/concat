import * as React from 'react';
import { DragSource } from 'react-dnd';

interface SignatureProps {
    signatureId: string;
    top: number;
    left: number;
    isDragging: boolean;
    connectDragSource: Function;
}

const SignatureSource = {
    beginDrag(props) {
        const { signatureId, top, left } = props;
        return { signatureId, top, left };
    }
};

@DragSource("SIGNATURE", SignatureSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
export default class Signature extends React.Component<SignatureProps, any> {
    constructor(props) {
        super(props);
    }

    render() {
        const { left, top, connectDragSource, isDragging } = this.props;

        const styles = {
            position: 'absolute',
            border: '1px dashed gray',
            padding: '0.5rem 1rem',
            cursor: 'move',
            top: top,
            left: left
        };

        if (isDragging) {
            return null;
        }

        return connectDragSource(
            <div style={styles} >
                <img src={'signatures/' + this.props.signatureId} />
            </div>
        );
    }
}
