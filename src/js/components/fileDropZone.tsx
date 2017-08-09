import * as React from 'react';
import { DropTarget } from 'react-dnd';

class FileDropZone extends React.Component<Sign.FileDropZoneProps, {}> {
    render() {
        const { connectDropTarget} = this.props;
        return connectDropTarget(
            <div className={"dropzone " + (this.props.isOver ? 'drag-over' : '')}>
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
    },
    hover(props: any) {
       if(props.onOver){
            props.onOver()
       }
    }
};

export default DropTarget("__NATIVE_FILE__", fileTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
}))(FileDropZone);