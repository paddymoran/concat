import * as React from "react";
import { findDOMNode } from "react-dom";
import SignatureCanvas from 'react-signature-canvas'
import { Button, Modal, Tabs, Tab, ControlLabel, FormGroup, FormControl } from 'react-bootstrap';
import * as Promise from 'bluebird';
import * as axios from 'axios';

interface SignatureSelectorProps {
    isVisible: boolean;
    onSignatureSelected: Function;
    showModal: Function;
    hideModal: Function;
}

const SELECT_SIGNATURE_TAB = 1;
const DRAW_SIGNATURE_TAB = 2;
const UPLOAD_SIGNATURE_TAB = 3;

export default class SignatureSelector extends React.Component<SignatureSelectorProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            selectedSignature: 0,
            currentTab: SELECT_SIGNATURE_TAB,
            signatureIds: []
        };
    }

    componentDidMount() {
        axios.get('/signatures') .then((response) => {
            let signatureIds = [];
            response.data.map((signature) => signatureIds.push(signature.id));

            this.setState({ signatureIds });
        });
    }

    changeTab(newTab) {
        this.setState({ currentTab: newTab });
    }

    changeSelectedSignature(key) {
        this.setState({ selectedSignature: key });
    }

    clearCanvas() {
        const signatureCanvas = this.refs['signature-canvas'];
        signatureCanvas.clear();
    }

    select() {
        let signatureId = -1;

        // If the user selected an existing signature, trigger the parents signatureSelected method with the signature ID
        if (this.state.currentTab == SELECT_SIGNATURE_TAB) {
            signatureId = this.state.signatureIds[this.state.selectedSignature];
            this.props.onSignatureSelected(signatureId);
        } else if (this.state.currentTab == DRAW_SIGNATURE_TAB) {
            // Get the signature image as a Data URL
            const signature = this.refs['signature-canvas'].getTrimmedCanvas().toDataURL();
            
            this.uploadSignature(signature);
        } else {
            const uploadField = this.refs['signature-upload'];
            
            var canvas = this.refs['upload-canvas'];
            var ctx = canvas.getContext('2d');
            var reader = new FileReader();
            var LOL_MAGIC_THRESHOLD = 230;
            var self = this;

            reader.readAsDataURL(uploadField.files[0]);

            reader.onload = function(event) {
                var img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;

                    ctx.drawImage(img, 0,0);
                    var imageData = ctx.getImageData(0,0,canvas.width, canvas.height);
                    var data = imageData.data;
                    function bgThreshold(r, g, b) {
                        if (r > LOL_MAGIC_THRESHOLD || g > LOL_MAGIC_THRESHOLD || b > LOL_MAGIC_THRESHOLD){
                            return true;
                        }
                    }

                    for (var i = 0; i < data.length; i += 4) {
                        if (bgThreshold(data[i], data[i + 1], data[i + 2])){
                            data[i + 3] = 0;
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);

                    self.uploadSignature(canvas.toDataURL());
                }
            }
        }
    }

    uploadSignature(base64Image) {
        // Upload image and trigger the parents signatureSelected method with the signature ID
        axios.post('/signatures/upload', {
            base64Image
        }).then((response) => {
            let signatureId = response.data.signature_id;

            // Add the new signature to the list of selectable signatures
            let signatureIds = this.state.signatureIds;
            signatureIds.push(signatureId);
            this.setState({ signatureIds });

            // Fire the signature selected event
            this.props.onSignatureSelected(signatureId);
        });
    }

    render() {
        const signatureCanvasOptions = {
            width: 500,
            height: 200,
            className: 'signature-drawer'
        };

        return (
            <div>
                <Button bsStyle='primary' onClick={() => this.props.showModal()}>
                    Add Signature
                </Button>

                <Modal show={this.props.isVisible} onHide={() => this.props.hideModal()}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select Signature</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs activeKey={this.state.currentTab} onSelect={this.changeTab.bind(this)} animation={false} id='select-signature-tabs'>
                            <Tab eventKey={SELECT_SIGNATURE_TAB} title="Select Signature" className="select-signature">
                                <div className="row">
                                    {this.state.signatureIds.map((id, i) => {
                                            let classes = 'col-sm-6 selectable';
                                            classes += i == this.state.selectedSignature ? ' selected' : '';

                                            return (
                                                <div className={classes} key={i} onClick={() => this.changeSelectedSignature(i) }>
                                                    <img className='img-responsive' src={`/signatures/${id}`} />
                                                </div>
                                            )
                                        })
                                    }

                                    { this.state.signatureIds.length == 0 &&
                                        <div className="col-xs-12">
                                            <p>No saved signatures</p>
                                        </div>
                                    }
                                </div>
                            </Tab>

                            <Tab eventKey={DRAW_SIGNATURE_TAB} title="Draw Signature">
                                <div className='signature-canvas-conatiner clearfix'>
                                    <SignatureCanvas canvasProps={signatureCanvasOptions} ref='signature-canvas' />
                                    <a className='pull-right' onClick={this.clearCanvas.bind(this)}>Clear</a>
                                </div>
                            </Tab>

                            <Tab eventKey={UPLOAD_SIGNATURE_TAB} title="Upload Signature">
                                <input id="my-file-selector" type="file" ref='signature-upload' />
                                <br/>
                                <canvas width="400" height="300" ref="upload-canvas"/>
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.props.hideModal()}>Close</Button>
                        <Button bsStyle='primary' onClick={this.select.bind(this)} >Select</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}
