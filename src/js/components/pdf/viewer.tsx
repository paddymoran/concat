import * as React from 'react';
import { findDOMNode } from 'react-dom';
import * as Promise from 'bluebird';
import { Button, Modal } from 'react-bootstrap';
import PDFPreview from './preview';
import PDFPage from './page';
import SignatureSelector from '../signatureSelector';
import { connect } from 'react-redux';
import { findSetForDocument } from '../../utils';
import { signDocument, moveSignature, addSignatureToDocument, setActivePage } from '../../actions';
import Signature from '../signature';
import * as AutoAffix from 'react-overlays/lib/AutoAffix'
import { Col, Row } from 'react-bootstrap';
import LazyLoad from 'react-lazy-load';
import * as Dimensions from 'react-dimensions';
import { signatureUrl, boundNumber } from '../../utils';
import { generateUUID } from '../uuid';
import { DragSource, DropTarget } from 'react-dnd';
import * as Waypoint from 'react-waypoint';


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
    addSignatureToDocument: (data: Sign.Actions.AddSignatureToDocumentPayload) => void;
    setActivePage: (payload: Sign.Actions.SetActivePagePayload) => void;
}

interface PDFPageWrapperProps {
    documentId: string;
    viewport: Sign.Viewport;
    pageNumber: number;
    containerWidth: number;
    setActivePage: Function;
}


class PDFPageWrapper extends React.PureComponent<PDFPageWrapperProps> {

    render() {
        const height = ((this.props.containerWidth / this.props.viewport.width) * this.props.viewport.height) | 0;
        let className = "pdf-page-wrapper ";
        if(height) {
            className += "loaded"
        }
        return <Waypoint topOffset='50px' bottomOffset={'50%'} onEnter={({ previousPosition, currentPosition, event }) => { this.props.setActivePage(this.props.pageNumber) }} >
                  <div className={className} id={`page-view-${this.props.pageNumber}`} >
            { this.props.pageNumber > 0 && <LazyLoad height={ height} offsetVertical={300}>
                   <PDFPage drawWidth={this.props.containerWidth} documentId={this.props.documentId} pageNumber={this.props.pageNumber} />
             </LazyLoad> }
             { this.props.pageNumber === 0 &&  <div style={{height: height}}><PDFPage drawWidth={this.props.containerWidth} documentId={this.props.documentId} pageNumber={this.props.pageNumber}  /></div> }
        </div>
        </Waypoint>
    };
}

const PDFPageWrapperDimensions = Dimensions()(PDFPageWrapper);

const PDFPreviewDimensions = Dimensions()(PDFPreview);


class PDFViewer extends React.Component<PDFViewerProps> {
    constructor(props: PDFViewerProps) {
        super(props);
        this.setActivePage = this.setActivePage.bind(this);
    }

    setActivePage(pageNumber: number) {
         this.props.setActivePage({
            documentId: this.props.documentId,
            pageNumber
        })
    }


    sign() {
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
            <div className='pdf-viewer' >
                <Modal show={this.props.signRequestStatus === Sign.DownloadStatus.InProgress} onHide={() => {}}>
                    <Modal.Body>
                        <div className='loading' />
                        <div className='text-center'>Signing document, please wait.</div>
                    </Modal.Body>
                </Modal>

               <AutoAffix viewportOffsetTop={0} offsetTop={50}>
                    <div className="controls">
                        <div className="container">
                            {!!this.props.selectedSignatureId && <DraggableAddSignatureControl signatureId={this.props.selectedSignatureId} />}

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
                    <Row  >
                        <Col lg={2} xsHidden={true} smHidden={true} mdHidden={true}  >
                         <AutoAffix viewportOffsetTop={50} offsetTop={0}  bottomClassName="bottom" affixClassName="affixed" >
                             <div>
                            <PDFPreviewDimensions documentId={this.props.documentId} width={120}  pageViewports={this.props.pageViewports} pageCount={this.props.pageCount} />
                            </div>
                          </AutoAffix>

                        </Col>
                        <Col lg={10} md={12} className="page-list">

                            { Array(this.props.pageCount).fill(null).map((item: any, index: number) => {
                                const signaturesIndexes = Object.keys(this.props.signatures).filter(signatureIndex => this.props.signatures[signatureIndex].pageNumber === index);

                                return (
                                    <DropTargetSignaturesPageWrapper
                                        key={index}
                                        pageNumber={index}
                                        signaturesIndexes={signaturesIndexes}
                                        addSignatureToDocument={this.props.addSignatureToDocument}
                                        selectedSignatureId={this.props.selectedSignatureId}
                                        viewport={this.props.pageViewports[index] || {height: 1, width: 1}}
                                    >
                                        <PDFPageWrapperDimensions ref="pdf-page" documentId={this.props.documentId} pageNumber={index}  setActivePage={this.setActivePage} viewport={this.props.pageViewports[index] || {height: 1, width: 1}}/>
                                    </DropTargetSignaturesPageWrapper>
                                );
                            })}
                       </Col>
                    </Row>
                </div>
            </div>
        );
    }
}


interface AddSignatureControlProps {
    signatureId: number;
    connectDragSource: Function;
    connectDragPreview: Function;
    isDragging: boolean;
}

class AddSignatureControl extends React.PureComponent<AddSignatureControlProps> {
    componentDidMount() {
        //this.preview();
    }

    preview() {
        // disable previews for now
        const img = new Image();
        img.src = signatureUrl(this.props.signatureId);
        img.onload = () => {
            this.props.connectDragPreview(img);
        }
    }

    componentWillUpdate(newProps : AddSignatureControlProps) {
        if(this.props.signatureId !== newProps.signatureId && newProps.signatureId){
           // this.preview();
        }
    }

    render() {
        return this.props.connectDragSource(
            <div className="signature-icon">
                <img src={signatureUrl(this.props.signatureId)} />
            </div>
        );
    }
}

interface SignaturesPageWrapperProps {
    pageNumber: number;
    signaturesIndexes: string[];
    selectedSignatureId?: number;
    addSignatureToDocument: (data: Sign.Actions.AddSignatureToDocumentPayload) => void;
    connectDropTarget: Function;
}

class SignaturesPageWrapper extends React.PureComponent<SignaturesPageWrapperProps> {
    constructor(props: SignaturesPageWrapperProps) {
        super(props);
        this.addSelected = this.addSelected.bind(this);
    }

    // TODO: Remove when we no longer want click to add
    addSelected(e: React.MouseEvent<HTMLElement>) {
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        if (this.props.selectedSignatureId && target.tagName==='CANVAS') { // lolololol
            return generateUUID()
                .then((id) => {
                    this.props.addSignatureToDocument({
                        signatureIndex: id,
                        signatureId: this.props.selectedSignatureId,
                        pageNumber: this.props.pageNumber,
                        xOffset: offsetX / rect.width,
                        yOffset: offsetY / rect.height
                    })
            })
        }
    }

    render() {
        const child = React.cloneElement(React.Children.only(this.props.children), { ref: 'pdf-page' });

        const body = (
            <div className="signature-wrapper">
                {this.props.signaturesIndexes.map(signatureIndex => <Signature key={signatureIndex} signatureIndex={signatureIndex} page={this.refs['pdf-page']} />)}
                {child}
            </div>
        );

        return this.props.connectDropTarget(body);
    }
}

interface SignatureDragSourceProps {
    signatureId: number;
}

const signatureSource: __ReactDnd.DragSourceSpec<AddSignatureControlProps> = {
    beginDrag(props) {
        return {
            signatureId: props.signatureId
        };
    }
};

const DraggableAddSignatureControl = DragSource(
    Sign.DragAndDropTypes.ADD_SIGNATURE_TO_DOCUMENT,
    signatureSource,
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    })
)(AddSignatureControl);

const signatureDropTarget: __ReactDnd.DropTargetSpec<SignaturesPageWrapperProps> = {
    drop(props, monitor, pageComponent) {
        const item : any = monitor.getItem();
        const { signatureId } = item;

        const pageBounds = findDOMNode(pageComponent).getBoundingClientRect()
        const dropTargetBounds = monitor.getClientOffset();

        // Get the top left position of the signature on the page
        const sigantureX = dropTargetBounds.x - pageBounds.left;
        const sigantureY = dropTargetBounds.y - pageBounds.top;

        // Find the centered position of the signature on the page
        const centeredSignatureX = sigantureX - (Sign.DefaultSignatureSize.WIDTH / 2);
        const centeredSignatureY = sigantureY - (Sign.DefaultSignatureSize.HEIGHT / 2);

        // Keep signature offsets within an expecptable bounds
        const boundCenteredSignatureX = boundNumber(centeredSignatureX, 0, pageBounds.width - Sign.DefaultSignatureSize.WIDTH);
        const boundCenteredSignatureY = boundNumber(centeredSignatureY, 0, pageBounds.height - Sign.DefaultSignatureSize.HEIGHT);

        // Convert the centered signature position to ratios
        const signatureXOffset = boundCenteredSignatureX / pageBounds.width;
        const signatureYOffset = boundCenteredSignatureY / pageBounds.height;

        generateUUID().then(signatureIndex =>
            props.addSignatureToDocument({
                signatureIndex,
                signatureId,
                pageNumber: props.pageNumber,
                xOffset: signatureXOffset,
                yOffset: signatureYOffset,
            }))
    }
};

const DropTargetSignaturesPageWrapper = DropTarget(
    Sign.DragAndDropTypes.ADD_SIGNATURE_TO_DOCUMENT,
    signatureDropTarget,
    connect => ({
        connectDropTarget: connect.dropTarget()
    })
)(SignaturesPageWrapper);


const ConnectedPDFViewer = connect(
    (state: Sign.State, ownProps: ConnectedPDFViewerProps) => ({
        documentSetId: findSetForDocument(state.documentSets, ownProps.documentId),
        pageCount: state.documents[ownProps.documentId] ? state.documents[ownProps.documentId].pageCount : 1,
        pageViewports: state.documents[ownProps.documentId] ? state.documents[ownProps.documentId].pageViewports || [] : [],
        signatures: state.documentViewer.signatures,
        signRequestStatus: state.documentViewer.signRequestStatus,
        selectedSignatureId: state.documentViewer.selectedSignatureId
    }),
    { signDocument, moveSignature, addSignatureToDocument, setActivePage }
)(PDFViewer)

export default ConnectedPDFViewer;