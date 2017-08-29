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
   // overlayDefaults: Sign.OverlayDefaults
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
    defaults?: Sign.DocumentSignature
}

interface TextProps extends DragProps{
    value: string;
    defaults?: Sign.DocumentText
}

interface SigState {
    xyRatio?: number
}

interface TextState {
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

class TextDragger extends React.PureComponent<TextProps, TextState> {
    constructor(props: TextProps){
        super(props);
        const height = Math.round(Sign.DefaultSignatureSize.TEXT_WIDTH_RATIO * this.props.containerWidth);
        this.state = {value: this.props.value, height, width: 1, dataUrl: null};
    }

    componentDidMount() {
        const canvas = stringToCanvas(this.state.height, this.state.value, Sign.DefaultSignatureSize.MIN_WIDTH);
        this.setState({width: this.state.height * (canvas.width / canvas.height), dataUrl: canvas.toDataURL()});

    }

    render() {
        const width = this.state.width;
        const height = this.state.height;
        return <div className="date-drag" style={getItemStyles(this.props, width, height )}>{ this.state.dataUrl ? <img src={this.state.dataUrl}/> : null }</div>
    }
}

class PromptDragger extends React.PureComponent<TextProps, TextState> {
    constructor(props: TextProps){
        super(props);
    }

    render() {
        const width = Sign.DefaultSignatureSize.WIDTH_RATIO * this.props.containerWidth;
        const height = width / 3;
        return <div className="prompt-drag" style={getItemStyles(this.props, width, height )}></div>
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
         {  itemType === Sign.DragAndDropTypes.ADD_DATE_TO_DOCUMENT && <TextDragger  clientOffset={this.props.clientOffset} value={this.props.item.value} containerWidth={this.props.containerWidth}/> }
         {  itemType === Sign.DragAndDropTypes.ADD_TEXT_TO_DOCUMENT && <TextDragger clientOffset={this.props.clientOffset} value={this.props.item.value} containerWidth={this.props.containerWidth}/> }
         {  itemType === Sign.DragAndDropTypes.ADD_PROMPT_TO_DOCUMENT && <PromptDragger clientOffset={this.props.clientOffset} value={this.props.item.value} containerWidth={this.props.containerWidth}/> }
     </div>
    );
  }
}

const DimensionedDragLayer = connect((state : Sign.State) => ({
    containerWidth: state.dimensions.width,
    //overlayDefaults: state.overlayDefaults
}))(CustomDragLayer)

const DimensionedConnectedDragLayer = DragLayer(monitor => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  clientOffset: monitor.getClientOffset(),
  isDragging: monitor.isDragging(),
}))(DimensionedDragLayer);



export default DimensionedConnectedDragLayer;