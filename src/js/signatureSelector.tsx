import * as React from "react";
import { findDOMNode } from "react-dom";
import SignatureCanvas from 'react-signature-canvas';
import { Alert, Button, ControlLabel, FormGroup, FormControl, Modal, Tab, Tabs } from 'react-bootstrap';
import * as Promise from 'bluebird';
import * as axios from 'axios';
import SignatureUpload from './signatureUpload.tsx';

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
            signatureIds: [],
            uploading: false
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
            const signature = this.refs['signature-canvas'].getTrimmedCanvas().toDataURL();
            this.uploadSignature(signature);
        } else {
            const signature = this.refs['signature-uploader'].toDataURL();

            if (signature == null) {
                this.setState({
                    signatureUploaderErrors: 'Please upload a signature'
                });
            } else {
                this.uploadSignature(signature);
            }
        }
    }

    uploadSignature(base64Image) {
        this.setState({ uploading: true });

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

            this.setState({ uploading: false });
        });
    }

    render() {
        const signatureCanvasOptions = {
            width: 500,
            height: 200
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
                                    { this.state.uploading && 
                                        <div className='loading' />
                                    }
                                    { !this.state.uploading &&
                                        <div className='signature-display'>
                                            <SignatureCanvas canvasProps={signatureCanvasOptions} ref='signature-canvas' />
                                            <a className='btn btn-default btn-block' onClick={this.clearCanvas.bind(this)}>Clear</a>
                                        </div>
                                    }
                                </div>
                            </Tab>

                            <Tab eventKey={UPLOAD_SIGNATURE_TAB} title="Upload Signature">
                                { this.state.signatureUploaderErrors &&
                                    <Alert bsStyle='danger'>
                                        { this.state.signatureUploaderErrors }
                                    </Alert>
                                }
                                { this.state.uploading && 
                                    <div className='loading' />
                                }
                                { !this.state.uploading &&
                                    <SignatureUpload ref='signature-uploader' />
                                }
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
