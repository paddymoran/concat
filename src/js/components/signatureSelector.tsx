import  * as React from "react";
import { findDOMNode } from "react-dom";
import SignatureCanvas from 'react-signature-canvas';
import { Alert, Button, ControlLabel, FormGroup, FormControl, Modal, Tab, Tabs } from 'react-bootstrap';
import * as Promise from 'bluebird';
import * as Axios from 'axios';
import axios from 'axios';
import SignatureUpload from './signatureUpload';
import { uploadSignature, selectSignature, showSignatureSelection, hideSignatureSelection, deleteSignature, addSignatureToDocument } from '../actions/index';
import { generateUUID } from './uuid';
import { connect } from 'react-redux';

interface SignatureSelectorProps {
    selectSignature: (signatureId: number) => void;
    uploadSignature: (payload: Sign.Actions.UploadSignaturePayload) => void;
    deleteSignature: (signatureId: number) => void;
    showModal: Function;
    hideModal: Function;
    uploading: boolean;
    isVisible: boolean;
    addSignatureToDocument: (payload: Sign.Actions.AddSignatureToDocumentPayload) => void;
}

interface SignatureSelectorState {
    selectedSignatureId: number;
    currentTab: number;
    signatureIds: number[];
    signatureUploaderErrors?: string
}

interface SignaturesResponse extends Axios.AxiosResponse {
    data: Array<{ id: number }>
}



const SELECT_SIGNATURE_TAB = 1;
const DRAW_SIGNATURE_TAB = 2;
const UPLOAD_SIGNATURE_TAB = 3;



export class SignatureSelector extends React.Component<SignatureSelectorProps, SignatureSelectorState> {
    private signatureCanvas: SignatureCanvas;

    constructor(props: SignatureSelectorProps) {
        super(props);

        this.state = {
            selectedSignatureId: null,
            currentTab: SELECT_SIGNATURE_TAB,
            signatureIds: []
        };
    }

    componentDidMount() {
        axios.get('/api/signatures')
            .then((response: SignaturesResponse) => {
                let signatureIds: number[] = [];
                response.data.map((signature) => signatureIds.push(signature.id));

                this.setState({ signatureIds });
            });
    }

    changeTab(newTab: number) {
        this.setState({ currentTab: newTab });
    }

    changeSelectedSignature(key: number) {
        this.setState({ selectedSignatureId: key });
    }

    clearCanvas() {
        this.signatureCanvas.clear();
    }

    deleteSignature() {
        this.props.deleteSignature(this.state.selectedSignatureId);
    }

    select() {
        if (this.state.currentTab == SELECT_SIGNATURE_TAB) {
            this.props.selectSignature(this.state.selectedSignatureId);
            // We need a unqiue string index - sounds like a UUID to me
            generateUUID().then(signatureIndex => this.props.addSignatureToDocument({
                signatureIndex,
                signatureId: this.state.selectedSignatureId,
                pageNumber: 0
            }));
        }
        else if (this.state.currentTab == DRAW_SIGNATURE_TAB) {
            const signature = this.signatureCanvas.getTrimmedCanvas().toDataURL();
            this.uploadSignature(signature);
        }
        else {
            const signature = this.signatureCanvas.toDataURL();
            if (signature === null) {
                this.setState({ signatureUploaderErrors: 'Please upload a signature' });
            }
            else {
                this.uploadSignature(signature);
            }
        }
        this.props.hideModal();
    }

    uploadSignature(base64Image: string) {
        this.props.uploadSignature({ data: base64Image });
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
                                    {this.state.signatureIds.map((id: number, i: number) => {
                                            let classes = 'col-sm-6 selectable';
                                            classes += id === this.state.selectedSignatureId ? ' selected' : '';

                                            return (
                                                <div className={classes} key={i} onClick={() => this.changeSelectedSignature(id) }>
                                                    <img className='img-responsive' src={`/api/signatures/${id}`} />
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
                                    { this.props.uploading &&
                                        <div className='loading' />
                                    }
                                    { !this.props.uploading &&
                                        <div className='signature-display'>
                                            <SignatureCanvas canvasProps={signatureCanvasOptions} ref={(ref: SignatureCanvas) => this.signatureCanvas = ref} />
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
                                { this.props.uploading &&
                                    <div className='loading' />
                                }
                                { !this.props.uploading &&
                                    <SignatureUpload ref='signature-uploader' />
                                }
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="warning" disabled={!this.state.selectedSignatureId} onClick={() => this.deleteSignature()}>Delete Signature</Button>
                        <Button onClick={() => this.props.hideModal()}>Close</Button>
                        <Button bsStyle='primary' onClick={this.select.bind(this)} >Select</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

export default connect(state => ({isVisible: state.modals.showing === 'selectSignature', uploading: false}), {
    uploadSignature: (payload) => uploadSignature(payload),
    selectSignature: (id) => selectSignature(id),
    deleteSignature: (id) => deleteSignature(id),
    showModal: () => showSignatureSelection(),
    hideModal: () => hideSignatureSelection(),
    addSignatureToDocument
})(SignatureSelector)
