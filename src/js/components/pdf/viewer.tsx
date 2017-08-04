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
import LazyLoad from 'react-lazy-load';
import * as Dimensions from 'react-dimensions';
import { signatureUrl } from '../../utils';


Promise.config({ cancellation: true });

interface ConnectedPDFViewerProps {
    documentId: string;
}

interface PDFViewerProps extends ConnectedPDFViewerProps {
    pageCount: number;
    pageViewports: Sign.Viewport[];
    documentSetId: string;
    signatures: Sign.DocumentSignatures;
    signRequestStatus: Sign.DownloadStatus;
    selectedSignatureId?: number;
    signDocument: (payload: Sign.Actions.SignDocumentPayload) => void;
    moveSignature: (payload: Sign.Actions.MoveSignaturePayload) => void;
}

interface PDFPageWrapperProps {
    documentId: string;
    viewport: Sign.Viewport;
    pageNumber: number;
    containerWidth: number;
}


class PDFPageWrapper extends React.PureComponent<PDFPageWrapperProps> {

    render() {
        const height = (this.props.containerWidth / this.props.viewport.width) * this.props.viewport.height;
        return <div className="pdf-page-wrapper" id={`page-view-${this.props.pageNumber}`}>
            { this.props.pageNumber > 0 && <LazyLoad height={ height} offsetVertical={300}>
                   <PDFPage drawWidth={this.props.containerWidth} documentId={this.props.documentId} pageNumber={this.props.pageNumber}  />
             </LazyLoad> }
            { this.props.pageNumber === 0 &&  <PDFPage drawWidth={this.props.containerWidth} documentId={this.props.documentId} pageNumber={this.props.pageNumber}  /> }
        </div>
    };
}

const PDFPageWrapperDimensions = Dimensions()(PDFPageWrapper);

class PDFViewer extends React.Component<PDFViewerProps> {

    constructor(props) {
        super(props);
        this.onSelectPage = this.onSelectPage.bind(this);
    }

    onSelectPage(pageNumber) {
        //sucks remove later
        document.querySelector(`#page-view-${pageNumber}`).scrollIntoView();
    }


    sign() {
        // Hardcoded for now

        // For each signature: onvert pixel values to ratios (of the page) and add page number
        const signatures: Sign.Actions.SignDocumentPayloadSignature[] = Object.keys(this.props.signatures).map(key => {
            const signature = this.props.signatures[key];
            return {
                signatureId: signature.signatureId,
                pageNumber: signature.pageNumber,
                offsetX: signature.xRatio,
                offsetY: signature.yRatio,
                ratioX: signature.widthRatio,
                ratioY: signature.heightRatio
            };
        });

        this.props.signDocument({
            documentSetId: this.props.documentSetId,
            documentId: this.props.documentId,
            signatures
        });
    }

    render() {
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
                            {!!this.props.selectedSignatureId && <div><img src={signatureUrl(this.props.selectedSignatureId)} style={{ height: '36px' }} /></div>}
                            
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
                        <Col lg={2} xsHidden={true} smHidden={true} mdHidden={true} >
                            <PDFPreview documentId={this.props.documentId} width={120} onSelectPage={this.onSelectPage} pageViewports={this.props.pageViewports} pageCount={this.props.pageCount}/>
                        </Col>
                        <Col lg={10} md={12} className="drag-container">
                            { Array(this.props.pageCount).fill(null).map((item: any, index: number) => {
                                const signaturesIndexes = Object.keys(this.props.signatures).filter(signatureIndex => this.props.signatures[signatureIndex].pageNumber === index);

                                return (
                                    <PDFPageWithSignatures
                                        key={index}
                                        documentId={this.props.documentId}
                                        pageNumber={index}
                                        viewport={this.props.pageViewports[index] || {height: 1, width: 1}}
                                        signaturesIndexes={signaturesIndexes} />
                                );
                            })}
                       </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

interface PDFPageWithSignaturesProps {
    documentId: string;
    pageNumber: number;
    viewport: Sign.Viewport;
    signaturesIndexes: string[];
}

class PDFPageWithSignatures extends React.PureComponent<PDFPageWithSignaturesProps> {
    render() {
        return (
            <div className="signature-wrapper">
                { this.props.signaturesIndexes.map(signatureIndex => <Signature key={signatureIndex} signatureIndex={signatureIndex} page={this.refs['pdf-page']} />)}
                <PDFPageWrapperDimensions ref="pdf-page" documentId={this.props.documentId} pageNumber={this.props.pageNumber} viewport={this.props.viewport}/>
            </div>
        );
    }
}


const ConnectedPDFViewer = connect(
    (state: Sign.State, ownProps: ConnectedPDFViewerProps) => ({
        documentSetId: findSetForDocument(state.documentSets, ownProps.documentId),
        pageCount: state.documents[ownProps.documentId] ? state.documents[ownProps.documentId].pageCount : 1,
        pageViewports: state.documents[ownProps.documentId] ? state.documents[ownProps.documentId].pageViewports || [] : [],
        signatures: state.documentViewer.signatures,
        signRequestStatus: state.documentViewer.signRequestStatus,
        selectedSignatureId: state.documentViewer.selectedSignatureId,
    }),
    { signDocument, moveSignature }
)(PDFViewer)

export default ConnectedPDFViewer;