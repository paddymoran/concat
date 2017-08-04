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
    signDocument: (payload: Sign.Actions.SignDocumentPayload) => void;
    moveSignature: (payload: Sign.Actions.MoveSignaturePayload) => void;
}

interface PDFPageWrapperProps {
    documentId: string;
    viewport: Sign.Viewport;
    pageNumber: number;
}


class PDFPageWrapper extends React.PureComponent<PDFPageWrapperProps> {
    render() {
        return (
            <div className="pdf-page">
                <LazyLoad height={(this.props.viewport || { height: null }).height || 1000 } offsetVertical={300}>
                    <PDFPage drawWidth={1000} documentId={this.props.documentId} pageNumber={this.props.pageNumber}  />
                </LazyLoad>
            </div>
        );
    }
}


class PDFViewer extends React.Component<PDFViewerProps> {
    sign() {
        // Hardcoded for now
        const pageWidth = this.props.pageViewports[0].width;
        const pageHeight = this.props.pageViewports[0].height;

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
                        { Array(this.props.pageCount).fill(null).map((item: any, index: number) => {
                            const signaturesIndexes = Object.keys(this.props.signatures).filter(signatureIndex => this.props.signatures[signatureIndex].pageNumber === index);

                            return (
                                <PDFPageWithSignatures
                                    documentId={this.props.documentId}
                                    pageNumber={index}
                                    viewport={this.props.pageViewports[index]}
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
            <div>
                { this.props.signaturesIndexes.map(signatureIndex => <Signature key={signatureIndex} signatureIndex={signatureIndex} page={this.refs['pdf-page']} />)}
                <PDFPageWrapper ref="pdf-page" documentId={this.props.documentId} pageNumber={this.props.pageNumber} viewport={this.props.viewport}/>
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
    }),
    { signDocument, moveSignature }
)(PDFViewer)

export default ConnectedPDFViewer;