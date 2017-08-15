import * as React from 'react';
import {  DragLayer } from 'react-dnd';
import { Button, Modal } from 'react-bootstrap';
import { signatureUrl, imageRatio } from '../utils';


function getItemStyles(props: SigProps, width: number, height: number) {

  const { clientOffset } = props;
  if (!clientOffset) {
    return {
      display: 'none',
    };
  }

  let { x, y } = clientOffset;
  const transform = `translate(${x-(width/2)}px, ${y-(height/2)}px)`;
  return {
    transform,
    WebkitTransform: transform,
    width,
    height
  };
}


interface DragLayerProps {
    clientOffset: {
        x: number,
        y: number,
    }
    itemType: string
    item:  {
        signatureId?: number
    }
    isDragging: boolean
}

interface SigProps {
    clientOffset: {
        x: number,
        y: number,
    }
    signatureId?: number
}

interface SigState {
    xyRatio?: number
}


class SignatureGetSize extends React.PureComponent<SigProps, SigState> {
    constructor(props : SigProps) {
        super(props);
        this.state = {};

    }
    componentDidMount() {

        return imageRatio(signatureUrl(this.props.signatureId))
            .then((xyRatio: number) => {
                return this.setState({ xyRatio })
            })
    }
    render() {
        const width = Sign.DefaultSignatureSize.WIDTH;
        const height = this.state.xyRatio ? width / this.state.xyRatio : Sign.DefaultSignatureSize.HEIGHT
        return <div style={getItemStyles(this.props, width, height )}><img src={signatureUrl(this.props.signatureId)}/></div>
    }
}


export class CustomDragLayer extends React.PureComponent<DragLayerProps> {

  render() {
    const { item, itemType, isDragging } = this.props;

    if(!isDragging){
        return false;
    }

    return (
      <div className="custom-drag">
         { isDragging  && <SignatureGetSize signatureId={this.props.item.signatureId} clientOffset={this.props.clientOffset} /> }
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