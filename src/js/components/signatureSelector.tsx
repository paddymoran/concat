import  * as React from "react";
import { findDOMNode } from "react-dom";
import SignatureCanvas from 'react-signature-canvas';
import { Alert, Button, ControlLabel, FormGroup, FormControl, Modal, Tab, Tabs } from 'react-bootstrap';
import * as Promise from 'bluebird';
import * as Axios from 'axios';
import axios from 'axios';
import SignatureUpload from './signatureUpload';
import { uploadSignature, selectSignature, showSignatureSelection, hideSignatureSelection, deleteSignature, addSignatureToDocument, requestSignatures } from '../actions/index';
import { generateUUID } from './uuid';
import { connect } from 'react-redux';
import Loading from './loading';

interface SignatureSelectorProps {
    uploading: boolean;
    isVisible: boolean;
    signatures: Sign.Signatures;
    showModal: () => void;
    hideModal: () => void;
    selectSignature: (signatureId: number) => void;
    uploadSignature: (payload: Sign.Actions.UploadSignaturePayload) => void;
    deleteSignature: (signatureId: number) => void;
    addSignatureToDocument: (payload: Sign.Actions.AddSignatureToDocumentPayload) => void;
    requestSignatures: () => void;
}

interface SignatureSelectorState {
    selectedSignatureId: number;
    currentTab: number;
    signatureUploaderErrors?: string
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
            currentTab: SELECT_SIGNATURE_TAB
        };
    }

    componentDidMount() {
        this.props.requestSignatures();
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
                <Button  onClick={() => this.props.showModal()}>
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
                                    {this.props.signatures.status === Sign.DownloadStatus.Complete && this.props.signatures.signatureIds.map((id: number, i: number) => {
                                            let classes = 'col-sm-6 selectable';
                                            classes += id === this.state.selectedSignatureId ? ' selected' : '';

                                            return (
                                                <div className={classes} key={i} onClick={() => this.changeSelectedSignature(id) }>
                                                    <img className='img-responsive' src={`/api/signatures/${id}`} />
                                                </div>
                                            )
                                        })
                                    }

                                    {this.props.signatures.status === Sign.DownloadStatus.Complete && this.props.signatures.signatureIds.length == 0 &&
                                        <div className="col-xs-12">
                                            <p>No saved signatures</p>
                                        </div>
                                    }
                                </div>
                            </Tab>

                            <Tab eventKey={DRAW_SIGNATURE_TAB} title="Draw Signature">
                                <div className='signature-canvas-conatiner clearfix'>
                                    { this.props.uploading && <Loading />}
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
                                {this.props.uploading && <Loading />}
                                {!this.props.uploading && <SignatureUpload ref='signature-uploader' />}
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

export default connect(
    (state: Sign.State) => ({
        isVisible: state.modals.showing === 'selectSignature',
        uploading: false,
        signatures: state.signatures,
    }),
    {
        uploadSignature,
        selectSignature,
        deleteSignature,
        showModal: showSignatureSelection,
        hideModal: hideSignatureSelection,
        addSignatureToDocument,
        requestSignatures,
    }
)(SignatureSelector)
