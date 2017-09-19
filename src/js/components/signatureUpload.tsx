import * as React from "react";
import { ImageDropZone as FileDropZone } from './fileDropZone';
import * as Promise from 'bluebird';
import * as Button from 'react-bootstrap/lib/Button';
import * as ButtonGroup from 'react-bootstrap/lib/ButtonGroup';


const removeImageBackground = (file: File) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const reader = new FileReader();
    const WHITE_THRESHOLD = 230;
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
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                let data = imageData.data;

            // Remove the background
                for (var i = 0; i < data.length; i += 4) {
                    const red = data[i], green = data[i + 1], blue = data[i + 2];

                    // If the red, green, and blue are brighter than the white threshold - make that pixel transparent
                    if (red > WHITE_THRESHOLD && green > WHITE_THRESHOLD && blue > WHITE_THRESHOLD) {
                        data[i + 3] = 0;
                    }
                }
                context.putImageData(imageData, 0, 0);
                resolve(canvas);
                }
            }
        }
        catch(e) {
            reject(e)
        }
    });
}

function rotate(imageURL: string, width: number, height: number, angle: number) {
    const image = new Image();

    return new Promise((resolve) => {
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = height;
            canvas.height = width;
            ctx.translate(canvas.width/2,canvas.height/2);
            ctx.rotate(angle);
             ctx.drawImage(image, -canvas.height*0.5, -canvas.width*0.5);
             return resolve(canvas);
         };
        image.src = imageURL;
     });
};


interface SignatureUploadProps {}

export default class SignatureUpload extends React.PureComponent<SignatureUploadProps, any> {
    _fileInput: HTMLInputElement;
    constructor(props: SignatureUploadProps) {
        super(props);
        this.collectFiles = this.collectFiles.bind(this);
        this.onClick = this.onClick.bind(this);
        this.fileDrop = this.fileDrop.bind(this);
        this.rotateLeft = this.rotateLeft.bind(this);
        this.rotateRight = this.rotateRight.bind(this);
        this.clearImage = this.clearImage.bind(this);
        this.setImage = this.setImage.bind(this);

        this.state = {
            signatureDataURL: null,
            width: null,
            height: null,
            error: null
        }
    }

    toDataURL() {
        return this.state.signatureDataURL;
    }

    setImage(canvas: HTMLCanvasElement){
        this.setState({ signatureDataURL: canvas.toDataURL(), width: canvas.width, height: canvas.height, error: null});
    }

    readImage(image: File) {
        removeImageBackground(image)
            .then(this.setImage)
            .catch(() => this.setState({error: 'Sorry, could not process image'}))
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


    rotateLeft() {
        rotate(this.state.signatureDataURL, this.state.width, this.state.height, -Math.PI/2)
            .then(this.setImage)
    }

    rotateRight() {
        rotate(this.state.signatureDataURL, this.state.width, this.state.height, Math.PI/2)
            .then(this.setImage)
    }

    clearImage() {
        this.setState({signatureDataURL: null})
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
        <div className="transparency-grid"><img className="signature-preview" src={this.state.signatureDataURL} /></div>
            <ButtonGroup>
            <Button onClick={this.rotateLeft}><i className="fa fa-rotate-left" aria-hidden="true"></i></Button>
            <Button onClick={this.rotateRight}><i className="fa fa-rotate-right" aria-hidden="true"></i></Button>
            <Button onClick={this.clearImage}><i className="fa fa-trash" aria-hidden="true"></i></Button>
            </ButtonGroup>
        </div>
    }

    render() {
        if(!this.state.signatureDataURL){
            return this.renderDrop()
        }
        return this.renderCanvas();
    }
}


