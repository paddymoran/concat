import * as React from "react";
import { Button, Modal, Tabs, Tab, ControlLabel, FormGroup, FormControl } from 'react-bootstrap';

const removeImageBackground = (canvas, file, finished) => {
    const context = canvas.getContext('2d');
    const reader = new FileReader();
    const WHITE_THRESHOLD = 230;

    // Read the uploaded file
    reader.readAsDataURL(file);

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

            finished(imageData);
        }
    }
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
        const canvas = this.refs['upload-canvas'];
        const image = this.refs['signature-upload'].files[0];

        removeImageBackground(canvas, image, (imageData) => {
            // Draw the image
            const context = canvas.getContext('2d');
            context.putImageData(imageData, 0, 0);

            // Save the canvas data URL in state to be used later
            this.setState({
                signatureDataURL: canvas.toDataURL()
            });
        });
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
