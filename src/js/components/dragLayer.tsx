import * as React from 'react';
import {  DragLayer } from 'react-dnd';
import { Button, Modal } from 'react-bootstrap';
import { signatureUrl, imageRatio } from '../utils';
import { connect } from 'react-redux';
import * as Moment from 'moment';


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


const IMG_STYLE = {width: '100%', height: '100%'};

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
    containerWidth: number;
}

interface SigProps {
    clientOffset: {
        x: number,
        y: number,
    }
    signatureId?: number;
     containerWidth: number;
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
        const width = Sign.DefaultSignatureSize.WIDTH_RATIO * this.props.containerWidth;
        const height = this.state.xyRatio ? width / this.state.xyRatio : Sign.DefaultSignatureSize.HEIGHT
        return <div style={getItemStyles(this.props, width, height )}><img style={IMG_STYLE} src={signatureUrl(this.props.signatureId)}/></div>
    }
}

class DateDragger extends React.PureComponent<SigProps, SigState> {
    render() {
        const width = 150;
        const height = 40;
        const string = Moment().format('DD MMMM YYYY');
        return <div style={getItemStyles(this.props, width, height )}><strong>{ string }</strong></div>
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
         { isDragging  && itemType === Sign.DragAndDropTypes.ADD_SIGNATURE_TO_DOCUMENT && <SignatureGetSize signatureId={this.props.item.signatureId} clientOffset={this.props.clientOffset} containerWidth={this.props.containerWidth}/> }
         { isDragging  && itemType === Sign.DragAndDropTypes.ADD_DATE_TO_DOCUMENT && <DateDragger  clientOffset={this.props.clientOffset} containerWidth={this.props.containerWidth}/> }
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


const DimensionedConnectedDragLayer = connect((state : Sign.State) => ({
    containerWidth: state.dimensions.width
}))(ConnectedDragLayer)

export default DimensionedConnectedDragLayer;