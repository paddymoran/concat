import * as React from 'react';
import { findDOMNode } from 'react-dom';
import * as Promise from 'bluebird';
import { Alert, Button, Modal } from 'react-bootstrap';
import { PDFPreview } from './preview';
import { PDFPage } from './page';
import SignatureSelector from '../signatureSelector';
import SignatureDragContainer from '../signatureDragContainer';
import * as Axios from 'axios';
import axios from 'axios';
import * as PDFJS from 'pdfjs-dist';

Promise.config({ cancellation: true });

interface PDFViewerProps {
    pdfDocumentProxy?: PDFDocumentProxy;
    worker?: boolean;
    removeDocument: Function;
    docId: string;
}

interface IPDFViewerState {
    signingError?: string;
    error?: string;
    pages?: PDFPageProxy[];
    pageNumber: number;
    signatureId?: string;
    signing: boolean;
    selectSignatureModalIsVisible: boolean;
}

interface PostSignResponse extends Axios.AxiosResponse {
    data: {file_id: string };
}

export default class PDFViewer extends React.Component<PDFViewerProps, IPDFViewerState> {
    _pdfPromise: Promise<PDFPageProxy[]>;
    _pagePromises: Promise<PDFPageProxy[]>;

    constructor(props: PDFViewerProps) {
        super(props);
        this._pdfPromise = null;
        this._pagePromises = null;
        this.state = {
            pageNumber: 1,
            selectSignatureModalIsVisible: false,
            signing: false,
        };
        this.changePage = this.changePage.bind(this)

        this.signatureSelected = this.signatureSelected.bind(this);
    }

    componentDidMount() {
        if (this.props.worker === false) {
            PDFJS.disableWorker = true;
        }
    }

    componentWillUnmount() {
        this.cleanup();
    }

    cleanup() {
        this._pdfPromise && this._pdfPromise.isPending() && this._pdfPromise.cancel();
        this._pagePromises && this._pagePromises.isPending() && this._pagePromises.cancel();
    }

    changePage(newPageNumber: number) {
        if (newPageNumber != this.state.pageNumber) {
            this.setState({ pageNumber: newPageNumber });
        }
    }

    showModal() {
        this.setState({ selectSignatureModalIsVisible: true });
    }

    hideModal() {
        this.setState({ selectSignatureModalIsVisible: false });
    }

    signatureSelected(signatureId: string) {
        this.setState({ signatureId, selectSignatureModalIsVisible: false, signingError: null });
    }

    sign() {
        if (!this.state.signatureId) {
            this.setState({ signingError: 'Please select add a signature' })
        }
        else {
            this.setState({ signing: true });

            const signatureContainer = this.refs['signature-container'] as SignatureDragContainer;
            const position = signatureContainer.relativeSignaturePosition();

            let data = new FormData();
            // data.append('file', this.props.file.file);
            data.append('signature_id', this.state.signatureId);
            data.append('page_number', this.state.pageNumber.toString());
            data.append('x_offset', position.x.toString());
            data.append('y_offset', position.y.toString());
            data.append('width_ratio', position.width.toString());
            data.append('height_ratio', position.height.toString());

            axios.post('/sign', data)
                .then((response: PostSignResponse) => {
                    this.setState({ signing: false });

                    const signedPDFLink = window.location.origin + '/signed-documents/' + response.data.file_id + '?filename=test.pdf';
                    window.open(signedPDFLink, '_blank');
                });
        }
    }

    render() {
        if (this.state.error) {
            return <div>{ this.state.error }</div>
        }

        if (!this.state.pages) {
            return <div className='loading' />;
        }

        const page = this.state.pages[this.state.pageNumber - 1];

        return (
            <div className='pdf-viewer'>
                <Modal show={this.state.signing} onHide={() => {}}>
                    <Modal.Body>
                        <div className='loading' />
                        <div className='text-center'>Signing document, please wait.</div>
                    </Modal.Body>
                </Modal>
                <PDFPreview
                    pages={this.state.pages}
                    changePage={this.changePage.bind(this)}
                    activePageNumber={this.state.pageNumber}
                    width={120} />

                <div className='pdf-container'>
                    {/*<div className='pdf-title'>{this.props.file.filename}</div>*/}
                    <div className='pdf-page-number'>Page {this.state.pageNumber} of {this.props.pdfDocumentProxy.numPages}</div>

                    <div className="button-row">
                        <Button bsStyle='info' onClick={() => this.props.removeDocument()}>
                            Close Document
                        </Button>

                        <SignatureSelector
                            isVisible={this.state.selectSignatureModalIsVisible}
                            showModal={this.showModal.bind(this)}
                            hideModal={this.hideModal.bind(this)}
                            onSignatureSelected={this.signatureSelected} />

                        <Button onClick={this.sign.bind(this)}>Sign Document</Button>
                    </div>

                    {this.state.signingError && <Alert bsStyle='danger'>{ this.state.signingError }</Alert>}

                    <SignatureDragContainer signatureId={this.state.signatureId} className="pdf-page-wrapper" ref="signature-container">
                        <PDFPage page={page} drawWidth={1000} docId={this.props.docId} pageNumber={this.state.pageNumber} />
                    </SignatureDragContainer>
                </div>
            </div>
        );
    }
}
