import  * as React from "react";
import SignatureCanvas from 'react-signature-canvas';
import { Alert, Button, Modal, Tab, Tabs } from 'react-bootstrap';
import SignatureUpload from './signatureUpload';
import { uploadSignature, selectSignature, showSignatureSelection,  deleteSignature, addSignatureToDocument, requestSignatures } from '../actions/index';
import { connect } from 'react-redux';
import Loading from './loading';

interface SignatureSelectorProps {
    uploading: boolean;
    signatures: Sign.Signatures;
    selectedSignatureId: number;
    hideModal: () => void;
    selectSignature: (signatureId: number) => void;
    uploadSignature: (payload: Sign.Actions.UploadSignaturePayload) => void;
    deleteSignature: (signatureId: number) => void;
    addSignatureToDocument: (payload: Sign.Actions.AddSignatureToDocumentPayload) => void;
    requestSignatures: () => void;
}

interface SignatureSelectorState {
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
            currentTab: SELECT_SIGNATURE_TAB
        };
    }

    componentDidMount() {
        this.props.requestSignatures();
    }

    changeTab(newTab: number) {
        this.setState({ currentTab: newTab });
    }

    changeSelectedSignature(selectedSignatureId: number) {
        this.props.selectSignature(selectedSignatureId);
    }

    clearCanvas() {
        this.signatureCanvas.clear();
    }

    deleteSignature() {
        this.props.deleteSignature(this.props.selectedSignatureId);
        this.props.selectSignature(null);
    }

    select() {
        if (this.state.currentTab == UPLOAD_SIGNATURE_TAB) {
            const signature = this.signatureCanvas.toDataURL();
            if (signature === null) {
                this.setState({ signatureUploaderErrors: 'Please upload a signature' });
            }
            else {
                this.uploadSignature(signature);
            }
        }
        else if (this.state.currentTab == DRAW_SIGNATURE_TAB) {
            const signature = this.signatureCanvas.getTrimmedCanvas().toDataURL();
            this.uploadSignature(signature);
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
        return  <Modal  show={true} onHide={() => this.props.hideModal()}>
            <Modal.Header closeButton>
                <Modal.Title>Select Signature</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs activeKey={this.state.currentTab} onSelect={this.changeTab.bind(this)} animation={false} id='select-signature-tabs'>
                    <Tab eventKey={SELECT_SIGNATURE_TAB} title="Select Signature" className="select-signature">
                        <div className="row">
                            {this.props.signatures.status === Sign.DownloadStatus.InProgress && <Loading />}

                            {this.props.signatures.status === Sign.DownloadStatus.Complete && this.props.signatures.signatureIds.map((id: number, i: number) => {
                                    let classes = 'col-sm-6 selectable';
                                    classes += id === this.props.selectedSignatureId ? ' selected' : '';

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
                <Button bsStyle="warning" disabled={!this.props.selectedSignatureId} onClick={() => this.deleteSignature()}>Delete Signature</Button>
                <Button onClick={() => this.props.hideModal()}>Close</Button>
                <Button bsStyle='primary' onClick={this.select.bind(this)} >Select</Button>
            </Modal.Footer>
        </Modal>

    }
}

class Signature extends React.Component<any> {
    render(){
        return (
            <div>
                <Button  onClick={() => this.props.showModal()}>
                    Add Signature
                </Button>
            </div>
        )
    }
}

export const SignatureButton = connect(
    undefined,
    {
        showModal: showSignatureSelection,
    }
)(Signature)

export const SignatureModal = connect(
    (state: Sign.State) => ({
        uploading: false,
        signatures: state.signatures,
        selectedSignatureId: state.documentViewer.selectedSignatureId,
    }),
    {
        uploadSignature,
        selectSignature,
        deleteSignature,
        addSignatureToDocument,
        requestSignatures,
    }
)(SignatureSelector)
