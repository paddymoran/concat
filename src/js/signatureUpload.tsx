import * as React from "react";
import { Button, Modal, Tabs, Tab, ControlLabel, FormGroup, FormControl } from 'react-bootstrap';

interface SignatureUploadProps {
}

export default class SignatureUpload extends React.Component<{}, any> {
    constructor(props) {
        super(props);
        this.state = {
            signatureDataURL: null
        }
    }

    toDataURL() {
        return this.state.signatureDataURL;
    }

    uploadImage() {
        const uploadField = this.refs['signature-upload'];
        const canvas = this.refs['upload-canvas'];
        
        const context = canvas.getContext('2d');
        const reader = new FileReader();
        const WHITE_THRESHOLD = 230;

        // Read the uploaded file
        reader.readAsDataURL(uploadField.files[0]);

        reader.onload = (event) => {
            // Create an image for the uploaded file
            const signatureImage = new Image();
            signatureImage.src = event.target.result;

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

                // Redraw the signature image (now with the background removed) to the context
                context.putImageData(imageData, 0, 0);

                // Save the signature image data URL
                this.setState({
                    signatureDataURL: canvas.toDataURL()
                });
            }
        }
    }

    render() {
        return (
            <div>
                <input type='file' ref='signature-upload' onChange={() => this.uploadImage()} accept='image/*' />
                <canvas width='400' height='300' ref='upload-canvas' />
            </div>
        )
    }
}
