import * as React from 'react';
import { DragSource, DropTarget, DragDropContext } from 'react-dnd';

class FileDropZone extends React.Component<Sign.FileDropZoneProps, {}> {
    render() {
        const { connectDropTarget} = this.props;
        return connectDropTarget(
            <div className="dropzone">
                { this.props.children }
                <div className="push-catch"></div>
            </div>
        );
    }
}

interface MonitorItem {
    files: File[]
}

const fileTarget = {
    drop(props: any, monitor: any) {
        const item = monitor.getItem() as MonitorItem;
        props.onDrop(item.files.filter(f => f.type === 'application/pdf'));
    }
};

export default DropTarget("__NATIVE_FILE__", fileTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
}))(FileDropZone);