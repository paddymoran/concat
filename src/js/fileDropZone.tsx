import * as React from 'react';
import { DragSource, DropTarget, DragDropContext } from 'react-dnd';

class FileDropZone extends React.Component<{connectDropTarget: Function, isOver: boolean, canDrop: boolean}, {}> {
    render() {
        const { connectDropTarget, isOver, canDrop } = this.props;
        return connectDropTarget(
            <div className="dropzone">
                { this.props.children }
                <div className="push-catch"></div>
            </div>
        );
    }
}

const fileTarget = {
    drop(props, monitor) {
        props.onDrop(monitor.getItem().files.filter(f => f.type === 'application/pdf'));
    }
};

export default DropTarget("__NATIVE_FILE__", fileTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
}))(FileDropZone);