import * as React from "react";

const removeImageBackground = (canvas: HTMLCanvasElement, file: File, finished: (imageData: ImageData) => void) => {
    const context = canvas.getContext('2d');
    const reader = new FileReader();
    const WHITE_THRESHOLD = 230;

    // Read the uploaded file
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

            finished(imageData);
        }
    }
}

interface SignatureUploadProps {}

export default class SignatureUpload extends React.Component<SignatureUploadProps, any> {
    constructor(props: SignatureUploadProps) {
        super(props);
        this.state = {
            signatureDataURL: null
        }
    }

    toDataURL() {
        return this.state.signatureDataURL;
    }

    uploadImage() {
        const canvas : HTMLCanvasElement = this.refs['upload-canvas'] as HTMLCanvasElement;
        const image = (this.refs['signature-upload'] as HTMLInputElement).files[0];

        removeImageBackground(canvas, image, (imageData: ImageData) => {
            // Draw the image
            const context = canvas.getContext('2d');
            context.putImageData(imageData, 0, 0);

            // Save the canvas data URL in state to be used later
            this.setState({ signatureDataURL: canvas.toDataURL() });
        });
    }

    render() {
        return (
            <div className='signature-display'>
                <canvas width='500' height='200' ref='upload-canvas' />
                <label className='btn btn-default btn-block'>
                    Upload signature
                    <input
                        type='file'
                        ref='signature-upload'
                        onChange={() => this.uploadImage()}
                        accept='image/*'
                        style={{ display: 'none' }} />
                </label>
            </div>
        )
    }
}
