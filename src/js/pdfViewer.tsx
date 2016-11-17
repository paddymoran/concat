import * as React from 'react';
import { findDOMNode } from 'react-dom';
import * as Promise from 'bluebird';
import { Alert, Button, Modal } from 'react-bootstrap';
import { PDFPreview } from './pdfPreview';
import { PDFPage } from './pdfPage';
import SignatureSelector from './signatureSelector';
import SignatureDragContainer from './signatureDragContainer';
import * as axios from 'axios';
const PDFJS = require('pdfjs-dist');

Promise.config({
    cancellation: true
});

interface PDFViewerProps {
    data: ArrayBuffer;
    file: any;
    worker?: boolean;
    url?: string;
    removeDocument: Function;
}

interface PostSignResponse extends Axios.AxiosXHR<{ file_id: string }> {}

export default class PDFViewer extends React.Component<PDFViewerProps, any> {
    _pdfPromise;
    _pagePromises;

    constructor(props) {
        super(props);
        this._pdfPromise = null;
        this._pagePromises = null;
        this.state = {
            pageNumber: 1,
            selectSignatureModalIsVisible: false,
            signing: false
        };
        this.completeDocument = this.completeDocument.bind(this);
    }

    componentDidMount() {
        if (this.props.worker === false) {
            PDFJS.disableWorker = true;
        }
        this.loadDocument(this.props);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.data && newProps.data !== this.props.data) {
            this.loadDocument(newProps);
        }
    }

    loadDocument(newProps) {
        if (newProps.data || newProps.url) {
            this.cleanup();
            this._pdfPromise = Promise.resolve(PDFJS.getDocument(newProps.data ? { data: newProps.data } : newProps.url))
                .then(this.completeDocument)
                .catch(PDFJS.MissingPDFException, () => this.setState({error: "Can't find PDF"}))
                .catch((e) => this.setState({error: e.message}))
        }
    }

    completeDocument(pdf) {
        this.setState({ pdf: pdf, error: null });
        this._pagePromises && this._pagePromises.isPending() && this._pagePromises.cancel();

        return this._pagePromises = Promise.map(Array(this.state.pdf.numPages).fill(), (p, i) => {
            return pdf.getPage(i + 1);
        })
        .then((pages) => {
            this.setState({ pages: pages });
            return pages;
        });
    }

    componentWillUnmount() {
        this.cleanup();
    }

    cleanup() {
        this._pdfPromise && this._pdfPromise.isPending() && this._pdfPromise.cancel();
        this._pagePromises && this._pagePromises.isPending() && this._pagePromises.cancel();
    }

    changePage(newPageNumber) {
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

    signatureSelected(signatureId) {
        this.setState({
            signatureId: signatureId,
            selectSignatureModalIsVisible: false,
            signingError: null
        });
    }

    sign() {
        if (!this.state.signatureId) {
            this.setState({ signingError: 'Please select add a signature' })
        } else {
            this.setState({
                signing: true
            });

            const signatureContainer = this.refs['signature-container'];
            const position = signatureContainer.relativeSignaturePosition();

            let data = new FormData();
            data.append('file', this.props.file.file);
            data.append('signature_id', this.state.signatureId);
            data.append('page_number', this.state.pageNumber);
            data.append('x_offset', position.x);
            data.append('y_offset', position.y);
            data.append('width_ratio', position.width);
            data.append('height_ratio', position.height);

            axios.post('/sign', data).then((uncastResponse) => {
                const response = uncastResponse as PostSignResponse;

                this.setState({
                    signing: false
                });

                const signedPDFLink = window.location.origin + '/signed-documents/' + response.data.file_id + '?filename=test.pdf';
                window.open(signedPDFLink, '_blank');
            });
        }
    }

    render() {
        if (this.state.error) {
            return <div>{ this.state.error }</div>
        }

        if (!this.state.pdf || !this.state.pages) {
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
                    <div className='pdf-title'>{this.props.file.filename}</div>
                    <div className='pdf-page-number'>Page {this.state.pageNumber} of {this.state.pdf.numPages}</div>

                    <div className="button-row">
                        <Button bsStyle='info' onClick={() => this.props.removeDocument()}>
                            Close Document
                        </Button>

                        <SignatureSelector
                            isVisible={this.state.selectSignatureModalIsVisible}
                            showModal={this.showModal.bind(this)}
                            hideModal={this.hideModal.bind(this)}
                            onSignatureSelected={this.signatureSelected.bind(this)} />

                        <Button onClick={this.sign.bind(this)}>Sign Document</Button>
                    </div>

                    { this.state.signingError && 
                        <Alert bsStyle='danger'>
                            { this.state.signingError }
                        </Alert>
                    }

                    <SignatureDragContainer
                        signatureId={this.state.signatureId}
                        className='pdf-page-wrapper'
                        ref='signature-container'
                    >
                        <PDFPage page={page} drawWidth={1000} />
                    </SignatureDragContainer>
                </div>
            </div>
        );
    }
}
