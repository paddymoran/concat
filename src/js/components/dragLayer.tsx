import * as React from 'react';
import { findDOMNode } from 'react-dom';
import {  DragLayer } from 'react-dnd';
import { Button, Modal } from 'react-bootstrap';
import { signatureUrl, imageRatio, stringToCanvas } from '../utils';
import { connect } from 'react-redux';


function getItemStyles(props: DragProps, width: number, height: number) {
  const { clientOffset } = props;
  if (!clientOffset) {
    return {
      display: 'none',
    };
  }
  let { x, y } = clientOffset;
  const transform = `translate(${x-(width/2)}px, ${y-(height/2)}px)`;
  const style = {
        transform,
        WebkitTransform: transform,
        width,
        height
      }
  return style;
}


const IMG_STYLE = {width: '100%', height: '100%'};

interface DragLayerProps {
    clientOffset: {
        x: number,
        y: number,
    }
    itemType: string
    item:  {
        signatureId?: number,
        value?: string
    }
    isDragging: boolean
    containerWidth: number;
}

interface DragProps {
    clientOffset: {
        x: number,
        y: number,
    }
    containerWidth: number;
}

interface SigProps extends DragProps{
    signatureId: number;
}

interface DateProps extends DragProps{
    value: string;
}

interface SigState {
    xyRatio?: number
}

interface DateState {
    value: string;
    height: number;
    width: number;
    dataUrl: string;
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
        return <div className="signature-drag" style={getItemStyles(this.props, width, height )}><img style={IMG_STYLE} src={signatureUrl(this.props.signatureId)}/></div>
    }
}

class DateDragger extends React.PureComponent<DateProps, DateState> {
    constructor(props: DateProps){
        super(props);
        const height = Sign.DefaultSignatureSize.TEXT_WIDTH_RATIO * this.props.containerWidth;
        this.state = {value: this.props.value, height, width: 1, dataUrl: null};
    }


    componentDidMount() {
        const canvas = stringToCanvas(this.state.height, this.state.value);
        this.setState({width: this.state.height * (canvas.width / canvas.height), dataUrl: canvas.toDataURL()});

    }

    render() {
        const width = this.state.width;
        const height = this.state.height;
        return <div className="date-drag" style={getItemStyles(this.props, width, height )}>{ this.state.dataUrl ? <img src={this.state.dataUrl}/> : null }</div>
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
         {  itemType === Sign.DragAndDropTypes.ADD_SIGNATURE_TO_DOCUMENT && <SignatureGetSize signatureId={this.props.item.signatureId} clientOffset={this.props.clientOffset} containerWidth={this.props.containerWidth}/> }
         {  itemType === Sign.DragAndDropTypes.ADD_DATE_TO_DOCUMENT && <DateDragger  clientOffset={this.props.clientOffset} value={this.props.item.value} containerWidth={this.props.containerWidth}/> }
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