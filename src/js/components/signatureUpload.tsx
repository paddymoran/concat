import * as React from "react";
import { ImageDropZone as FileDropZone } from './fileDropZone';
import * as Promise from 'bluebird';
import * as Button from 'react-bootstrap/lib/Button';
import * as ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Slider  from 'rc-slider';
import ReactRnd from 'react-rnd';
import sizeMe from 'react-sizeme';
import { debounce } from '../utils'

const fileToImageData = (file: File) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const reader = new FileReader();
    // Read the uploaded file
    return new Promise((resolve, reject) => {
        try{
            reader.readAsDataURL(file);
            reader.onload = () => {
            // Create an image for the uploaded file
            const signatureImage = new Image();
            signatureImage.src = reader.result;

            signatureImage.onload = () => {
                // Make the canvas the same size as the uploaded image
                canvas.width = signatureImage.width;
                canvas.height = signatureImage.height;
                context.drawImage(signatureImage, 0,0);
                resolve(context.getImageData(0, 0, canvas.width, canvas.height));
                }
            }
        }
        catch(e) {
            reject(e)
        }
    });
}

function imageDataToCanvas(data: ImageData){
    const canvas = document.createElement('canvas');
    canvas.width = data.width;
    canvas.height = data.height;
    const context = canvas.getContext('2d');
    context.putImageData(data, 0, 0);
    return canvas;
}

function copyImageData(data: ImageData){
    // cross browser way is annoying
    const canvas = imageDataToCanvas(data);
    const context = canvas.getContext('2d');
    return context.getImageData(0, 0, canvas.width, canvas.height);
}

function imageDataToDataUrl(imageData: ImageData) {
    return imageDataToCanvas(imageData).toDataURL();
}

const removeImageBackground = (imageData: ImageData, threshold: number) => {
    let data = imageData.data;
    // Remove the background
    for (var i = 0; i < data.length; i += 4) {
        const red = data[i], green = data[i + 1], blue = data[i + 2];
        // If the red, green, and blue are brighter than the white threshold - make that pixel transparent
        if (red > threshold && green > threshold && blue > threshold) {
            data[i + 3] = 0;
        }
    }
    return imageData;
}


interface CropBoxDimensions {
    x: number,
    y: number,
    width: number,
    height: number;
}


function cropImageData(imageData: ImageData, crop: CropBoxDimensions) {
    const canvas = imageDataToCanvas(imageData);
    const ctx = canvas.getContext('2d');
    return ctx.getImageData(crop.x*imageData.width, crop.y*imageData.height, crop.width*imageData.width, crop.height*imageData.height);
}


function rotate(imageData: ImageData, rotation: number) {
    if(!rotation){
        return imageData;
    }
    const angle = (Math.PI/2) * rotation;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width =  imageData.width;
    const height = imageData.height;
    canvas.width = rotation % 2 == 0 ? width : height;
    canvas.height = rotation % 2 == 0 ? height: width;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(angle);
    const imageCanvas = imageDataToCanvas(imageData);
    if(rotation % 2){
        ctx.drawImage(imageCanvas, -canvas.height/2, -canvas.width/2);
    }
    else{
        ctx.drawImage(imageCanvas, -canvas.width/2, -canvas.height/2);
    }
    return ctx.getImageData(0, 0, canvas.width, canvas.height)
};

interface CropBoxProps {
    size: {width: number, height: number};
    innerRef: (ref: CropBox) => void;
}



interface CropBoxState extends CropBoxDimensions {

}


export class CropBox extends React.PureComponent<CropBoxProps, CropBoxState> {
    private static HANDLER_STYLES = {
        bottom: 'handler',
        bottomLeft: 'handler-corner',
        bottomRight: 'handler-corner',
        left: 'handler',
        right: 'handler',
        top: 'handler',
        topLeft: 'handler-corner',
        topRight: 'handler-corner'
    };

    constructor(props: CropBoxProps) {
        super(props);
        this.onDrag = this.onDrag.bind(this);
        this.onResize = this.onResize.bind(this);
        this.state = {
            width:  props.size.width * 0.8,
            height:  props.size.height  * 0.8,
            x: props.size.width * 0.1,
            y: props.size.height * 0.1
        };

    }

    componentDidMount(){
        this.props.innerRef && this.props.innerRef(this);
    }

    componentWillUnmount(){
        this.props.innerRef && this.props.innerRef(undefined);
    }

    componentWillReceiveProps(newProps: CropBoxProps) {
        if(this.props.size.height !== newProps.size.height) {
            const newPosition = {
                width: newProps.size.width * 0.8,
                height: newProps.size.height  * 0.8,
                x: newProps.size.width * 0.1,
                y: newProps.size.height * 0.1
            };
            this.setState(newPosition);
            const el = this.refs.rnd as ReactRnd;
            if(el){
                el.updateSize(newPosition);
                el.updatePosition(newPosition);
            }


        }
    }

    onDrag(e: any, d:any) {
        let x = Math.max(0, d.x);
        let y = Math.max(0, d.y);
        x = Math.min(this.props.size.width -this.state.width, x);
        y = Math.min(this.props.size.height - this.state.height, y);
        this.setState({ x, y })
    }

    onResize(e:any, direction:any, ref:any, delta:any, position:any){

        this.setState({
              width: ref.offsetWidth,
              height: ref.offsetHeight,
              ...position,
        });
    }

    getRelativeCrop() {
        return {
            x: this.state.x/this.props.size.width,
            y: this.state.y/this.props.size.height,
            width: this.state.width/this.props.size.width,
            height: this.state.height/this.props.size.height,
        }
    }

    render() {
        if(!this.props.size.height){
            return <div> { this.props.children } </div>
        }
         return <div className="crop-box">
             <ReactRnd
                ref="rnd"
                default={this.state}
                  size={{ width: this.state.width,  height: this.state.height }}
                  position={{ x: this.state.x, y: this.state.y }}
                  onDrag={this.onDrag}
                  onResize={this.onResize}
                bounds="parent"
                minWidth={10}
                minHeight={10}
                resizeHandlerClasses={CropBox.HANDLER_STYLES}
                className={'signature-crop'}
            />
            { this.props.children }
            {/* left */ }
             <div className="crop-box-bg" style={{left: 0, top:0, bottom: 0, width: this.state.x}} />
            {/* top */ }
             <div className="crop-box-bg" style={{left: this.state.x, top: 0, height: this.state.y, width: this.state.width}} />
            {/* right */ }
             <div className="crop-box-bg" style={{top: 0,  bottom:0,  left: this.state.x + this.state.width, right: 0}} />
            {/* bottom */ }
             <div className="crop-box-bg" style={{left: this.state.x, bottom: 0, top: this.state.y + this.state.height, width: this.state.width}} />

            </div>
    }
}

const DimensionedCropBox = sizeMe<{innerRef: (ref: CropBox) => void}>({refreshMode: 'debounce', monitorWidth: true, monitorHeight: true})(CropBox);


interface SignatureUploadProps {}

export default class SignatureUpload extends React.PureComponent<SignatureUploadProps, any> {
    _fileInput: HTMLInputElement;

    cropBox: CropBox;

    constructor(props: SignatureUploadProps) {
        super(props);
        this.collectFiles = this.collectFiles.bind(this);
        this.onClick = this.onClick.bind(this);
        this.fileDrop = this.fileDrop.bind(this);
        this.rotateLeft = this.rotateLeft.bind(this);
        this.rotateRight = this.rotateRight.bind(this);
        this.clearImage = this.clearImage.bind(this);
        this.setImage = this.setImage.bind(this);
        this.onSliderChange = debounce(this.onSliderChange.bind(this), 300);
        this.state = {
            imageData: null,
            rotation: 0,
            error: null,
            sliderValue: 200
        }
    }

    toDataURL() {
        let imageData = this.processImage();
        if(this.cropBox){
            const crop = this.cropBox.getRelativeCrop();
            imageData = cropImageData(imageData, crop)
        }
        return imageDataToDataUrl(imageData);
    }

    setImage(imageData : ImageData){
        this.setState({imageData});
    }

    readImage(image: File) {
        fileToImageData(image)
            .then((imageData: ImageData) =>  this.setState({imageData, rotation: 0}))
            .catch((e) =>{
                this.setState({error: 'Sorry, could not process image'})
             })
    }

    fileDrop(files: File[]) {
        this.readImage(files[0])
    }

    collectFiles(event: React.ChangeEvent<HTMLInputElement>) {
       this.fileDrop([].filter.call(event.target.files, (f: File) => f.type.indexOf('image') === 0));
    }

    onClick() {
        if (this._fileInput) {
            this._fileInput.value = null;
            this._fileInput.click();
        }
    }

    onSliderChange(sliderValue: number) {
        this.setState({sliderValue});
    }

    rotateLeft() {
        this.setState({rotation: this.state.rotation -1})

    }

    rotateRight() {
        this.setState({rotation: this.state.rotation +1})
    }

    clearImage() {
        this.setState({imageData: null})
    }

    processImage(){
        return rotate(removeImageBackground(copyImageData(this.state.imageData), this.state.sliderValue), this.state.rotation);
    }

    processImageToUrl(){
        return imageDataToDataUrl(this.processImage());
    }

    renderDrop() {
        return (
                <FileDropZone onDrop={this.fileDrop}>
            <div className='signature-display'>
            { this.state.error && <div className="alert alert-danger">{ this.state.error } </div>}
                <div className="explanation fake-drop-zone" onClick={this.onClick}>
                    <span className="drag-instruction">Drag an image of your signature here, or click to select</span>
                    <span className="drop-instruction">DROP HERE</span>
                        <input type="file" name="files" style={{display: 'none'}} ref={(el) => this._fileInput = el} onChange={this.collectFiles} accept="image/*"/>
                    </div>

            </div>
            </FileDropZone>
        )
    }

    renderCanvas() {

        return <div>
        <div className="transparency-grid">
             <DimensionedCropBox  innerRef={(ref: CropBox) => { this.cropBox = ref }}>

            <img className="signature-preview" src={this.processImageToUrl()} />

              </DimensionedCropBox>

        </div>
        <div className="slider-help">Move the slider until you can only see the background grid and your signature</div>
        <Slider
            defaultValue={this.state.sliderValue}
               onChange={this.onSliderChange}
            onAfterChange={this.onSliderChange}
            step={1}
            max={255}
            min={0}
             />

            <ButtonGroup>
            <Button onClick={this.rotateLeft}><i className="fa fa-rotate-left" aria-hidden="true"></i></Button>
            <Button onClick={this.rotateRight}><i className="fa fa-rotate-right" aria-hidden="true"></i></Button>
            <Button onClick={this.clearImage}><i className="fa fa-trash" aria-hidden="true"></i></Button>
            </ButtonGroup>
        </div>
    }

    render() {
        if(!this.state.imageData){
            return this.renderDrop()
        }
        return this.renderCanvas();
    }
}


