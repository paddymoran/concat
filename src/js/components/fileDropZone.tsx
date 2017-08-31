import * as React from 'react';
import { DropTarget } from 'react-dnd';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';


class FileDropZone extends React.PureComponent<Sign.FileDropZoneProps, {}> {
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

const PDFFileTarget = {
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

export default DropTarget("__NATIVE_FILE__", PDFFileTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
}))(FileDropZone);



const ImageFileTarget = {
    drop(props: any, monitor: any) {
        const item = monitor.getItem() as MonitorItem;
        props.onDrop(item.files.filter(f => f.type.indexOf('image/') === 0));
    },
    hover(props: any) {
       if(props.onOver){
            props.onOver()
       }
    }
};

export const ImageDropZone = DropTarget("__NATIVE_FILE__", ImageFileTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
}))(FileDropZone);