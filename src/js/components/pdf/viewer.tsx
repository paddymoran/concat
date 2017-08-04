import * as React from 'react';
import { findDOMNode } from 'react-dom';
import * as Promise from 'bluebird';
import { Alert, Button, Modal } from 'react-bootstrap';
import PDFPreview from './preview';
import PDFPage from './page';
import SignatureSelector from '../signatureSelector';
import * as Axios from 'axios';
import axios from 'axios';
import { connect } from 'react-redux';
import { findSetForDocument } from '../../utils';
import { signDocument, moveSignature } from '../../actions';
import Signature from '../signature';
import * as AutoAffix from 'react-overlays/lib/Affix'
import { Col, Row } from 'react-bootstrap';


Promise.config({ cancellation: true });

interface ConnectedPDFViewerProps {
    worker?: boolean;
    documentId: string;
}

interface PDFViewerProps extends ConnectedPDFViewerProps {
    documentSetId: string;
    signatures: Sign.DocumentSignatures;
    signRequestStatus: Sign.DownloadStatus;
    pageViewports: Sign.Viewport[];
    signDocument: (payload: Sign.Actions.SignDocumentPayload) => void;
    moveSignature: (payload: Sign.Actions.MoveSignaturePayload) => void;
}

interface IPDFViewerState {
    signingError?: string;
    error?: string;
    pages?: PDFPageProxy[];
    pageNumber: number;
    signatureId?: number;
    signing: boolean;
}

interface PostSignResponse extends Axios.AxiosResponse {
    data: {file_id: string };
}

class PDFViewer extends React.Component<PDFViewerProps, IPDFViewerState> {
    _pdfPromise: Promise<PDFPageProxy[]>;
    _pagePromises: Promise<PDFPageProxy[]>;

    constructor(props: PDFViewerProps) {
        super(props);
        this._pdfPromise = null;
        this._pagePromises = null;
        this.state = {
            pageNumber: 0,
            signing: false,
        };

        this.changePage = this.changePage.bind(this);
    }

    componentDidMount() {
        if (this.props.worker === false) {
            //PDFJS.disableWorker = true;
        }
    }

    changePage(newPageNumber: number) {
        if (newPageNumber != this.state.pageNumber) {
            this.setState({ pageNumber: newPageNumber });
        }
    }

    sign() {
        // Check there is at least one signature
        if (Object.keys(this.props.signatures).length === 0) {
            this.setState({ signingError: 'Please select add a signature' })
        }

        // Hardcoded for now
        const pageWidth = this.props.pageViewports[this.state.pageNumber].width;
        const pageHeight = this.props.pageViewports[this.state.pageNumber].height;

        // For each signature: onvert pixel values to ratios (of the page) and add page number
        const signatures: Sign.Actions.SignDocumentPayloadSignature[] = Object.keys(this.props.signatures).map(key => {
            const signature = this.props.signatures[key];

            return {
                signatureId: signature.signatureId,
                pageNumber: 0,
                offsetX: signature.xRatio,
                offsetY: signature.yRatio,
                ratioX: signature.widthRatio / pageWidth,
                ratioY: signature.heightRatio / pageHeight
            };
        });

        this.props.signDocument({
            documentSetId: this.props.documentSetId,
            documentId: this.props.documentId,
            signatures
        });
    }

    render() {
        if (this.state.error) {
            return <div>{ this.state.error }</div>
        }

        return (
            <div className='pdf-viewer'>
                <Modal show={this.props.signRequestStatus === Sign.DownloadStatus.InProgress} onHide={() => {}}>
                    <Modal.Body>
                        <div className='loading' />
                        <div className='text-center'>Signing document, please wait.</div>
                    </Modal.Body>
                </Modal>

                <AutoAffix viewportOffsetTop={0} offsetTop={50}>
                    <div className="controls">
                        <div className="container">
                            <SignatureSelector />

                            <div><Button>Add Initials</Button></div>
                            <div><Button>Add Date</Button></div>

                            <div>
                                <Button onClick={this.sign.bind(this)} disabled={this.props.signRequestStatus === Sign.DownloadStatus.InProgress}>Sign Document</Button>
                            </div>
                        </div>
                    </div>
                </AutoAffix>

                <div className='pdf-container container'>
                    <Row>
                        <Col lg={2}>
                            <AutoAffix offsetTop={50}>
                                <PDFPreview documentId={this.props.documentId} width={120} />
                            </AutoAffix>
                        </Col>
                        <Col lg={10} className="drag-container">
                            { Object.keys(this.props.signatures).map(key => <Signature key={key} signatureIndex={key} page={this.refs['pdf-page']} />)}
                            <PDFPage drawWidth={1000} documentId={this.props.documentId} pageNumber={this.state.pageNumber} ref='pdf-page' />
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}



const ConnectedPDFViewer = connect(
    (state: Sign.State, ownProps: ConnectedPDFViewerProps) => ({
        documentSetId: findSetForDocument(state.documentSets, ownProps.documentId),
        signatures: state.documentViewer.signatures,
        signRequestStatus: state.documentViewer.signRequestStatus,
    }),
    { signDocument, moveSignature }
)(PDFViewer)

export default ConnectedPDFViewer;