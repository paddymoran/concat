import * as React from 'react';
import {  DragLayer } from 'react-dnd';


function getItemStyles(props: DragLayerProps) {

  const { clientOffset } = props;
  if (!clientOffset) {
    return {
      display: 'none',
    };
  }

  let { x, y } = clientOffset;
  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
     backgroundColor: 'red',
    width: 100,
    height: 100,
  };
}


interface DragLayerProps {
    clientOffset: {
        x: number,
        y: number,
    }
    itemType: string
    item: React.Component
    isDragging: boolean
}



export class CustomDragLayer extends React.PureComponent<DragLayerProps> {

  render() {
    const { item, itemType, isDragging } = this.props;

    console.log(this.props)
    if(!isDragging){
        return false;
    }

    return (
      <div className="custom-drag">
     { isDragging  && <div style={getItemStyles(this.props)} /> }

      </div>

    );
  }
}

const ConnectedDragLayer = DragLayer(monitor => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  clientOffset: monitor.getClientOffset(),
  isDragging: monitor.isDragging(),
}))(CustomDragLayer);

export default ConnectedDragLayer;