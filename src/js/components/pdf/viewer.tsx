import * as React from 'react';
import { findDOMNode } from 'react-dom';
import * as Promise from 'bluebird';
import { Alert, Button, Modal } from 'react-bootstrap';
import PDFPreview from './preview';
import PDFPage from './page';
import SignatureSelector from '../signatureSelector';
import SignatureDragContainer from '../signatureDragContainer';
import * as Axios from 'axios';
import axios from 'axios';
import { connect } from 'react-redux';
import { findSetForDocument } from '../../utils';
import { signDocument } from '../../actions';
import Signature from '../signature';
import * as AutoAffix from 'react-overlays/lib/Affix'
import { Col, Row } from 'react-bootstrap';
import LazyLoad from 'react-lazy-load';
import * as Dimensions from 'react-dimensions';


Promise.config({ cancellation: true });

interface ConnectedPDFViewerProps {
    documentId: string;
}

interface PDFViewerProps extends ConnectedPDFViewerProps {
    signDocument: (payload: Sign.Actions.SignDocumentPayload) => void;
    pageCount: number;
    pageViewports: Sign.Viewport[],
    documentSetId: string;
    signatures: Sign.DocumentSignatures;
    signRequestStatus: Sign.DownloadStatus;
}


class PDFPageWrapper extends React.Component {
    render() {
        const height = (this.props.containerWidth / this.props.viewport.width) * this.props.viewport.height;
        return <div className="pdf-page-wrapper">
            <LazyLoad height={ height } offsetVertical={300}>
                   <PDFPage drawWidth={this.props.containerWidth} documentId={this.props.documentId} pageNumber={this.props.pageNumber}  />
             </LazyLoad>
        </div>
    }
}

const PDFPageWrapperDimensions = Dimensions()(PDFPageWrapper);

class PDFViewer extends React.Component<PDFViewerProps> {


    sign() {


        // Hardcoded for now
        const pageWidth = 940;
        const pageHeight = 1328;

        // For each signature: onvert pixel values to ratios (of the page) and add page number
        const signatures: Sign.Actions.SignDocumentPayloadSignature[] = Object.keys(this.props.signatures).map(key => {
            const signature = this.props.signatures[key];

            return {
                signatureId: signature.signatureId,
                pageNumber: 0,
                offsetX: signature.x / pageWidth,
                offsetY: signature.y / pageHeight,
                ratioX: signature.width / pageWidth,
                ratioY: signature.height / pageHeight
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
                        <Col lg={2} xsHidden={true} smHidden={true} mdHidden={true} >
                            <PDFPreview documentId={this.props.documentId} width={120} />
                        </Col>
                        <Col lg={10} md={12} className="drag-container">
                            {Object.keys(this.props.signatures).map(key => <Signature key={key} signatureIndex={key} /> )}
                                  { Array(this.props.pageCount).fill(null).map((item: any, index: number) => {
                                    return  <PDFPageWrapperDimensions  key={index}  documentId={this.props.documentId} pageNumber={index} viewport={this.props.pageViewports[index] || {width: 0}}/>
                          }) }

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
        pageCount: state.documents[ownProps.documentId] ? state.documents[ownProps.documentId].pageCount : 1,
        pageViewports: state.documents[ownProps.documentId] ? state.documents[ownProps.documentId].pageViewports || [] : [],
        signatures: state.documentViewer.signatures,
        signRequestStatus: state.documentViewer.signRequestStatus
    }),
    { signDocument }
)(PDFViewer)

export default ConnectedPDFViewer;