import * as React from 'react';
import { findDOMNode } from 'react-dom';
import * as Promise from 'bluebird';
import { Button, Modal } from 'react-bootstrap';
import PDFPreview from './preview';
import PDFPage from './page';
import { SignatureButton, InitialButton } from '../signatureSelector';
import { DateButton } from '../textSelector';
import { connect } from 'react-redux';
import { findSetForDocument } from '../../utils';
import { signDocument, moveSignature, addSignatureToDocument, addDateToDocument, setActivePage, showSignConfirmationModal } from '../../actions';
import { SignaturePositionable, DatePositionable } from '../positionable';
import * as AutoAffix from 'react-overlays/lib/AutoAffix'
import { Col, Row } from 'react-bootstrap';
import LazyLoad from 'react-lazy-load';
import sizeMe from 'react-sizeme';
import { signatureUrl, boundNumber, imageRatio, stringToCanvas } from '../../utils';
import { generateUUID } from '../uuid';
import { DragSource, DropTarget } from 'react-dnd';
import * as Waypoint from 'react-waypoint';
import { getEmptyImage } from 'react-dnd-html5-backend';
import WidthSpy from '../widthSpy'
import * as Moment from 'moment';


Promise.config({ cancellation: true });

interface PDFViewerProps {
    documentId: string;
    documentSetId: string;
}

interface ConnectedPDFViewerProps extends PDFViewerProps {
    pageCount: number;
    pageViewports: Sign.Viewport[];
    signatures: Sign.DocumentSignatures;
    dates: Sign.DocumentDates;
    signRequestStatus: Sign.DownloadStatus;
    selectedSignatureId: number;
    selectedInitialId: number;
    signDocument: (payload: Sign.Actions.SignDocumentPayload) => void;
    addSignatureToDocument: (data: Sign.Actions.AddSignatureToDocumentPayload) => void;
    addDateToDocument: (data: Sign.Actions.AddDateToDocumentPayload) => void;
    setActivePage: (payload: Sign.Actions.SetActivePagePayload) => void;
    showSignConfirmationModal: (payload: Sign.Actions.ShowSignConfirmationModalPayload) => void;
}

interface PDFPageWrapperProps {
    documentId: string;
    viewport: Sign.Viewport;
    pageNumber: number;
    containerWidth?: number;
    containerHeight?: number;
    setActivePage: Function;
}


interface SignatureDragSourceProps {
    signatureId: number;
}

interface DragProps {
    connectDragSource?: Function;
    connectDragPreview?: Function;
    isDragging?: boolean;
}


interface AddSignatureControlProps extends DragProps {
    signatureId: number;
}

interface AddDateControlProps extends DragProps {

}


const signatureSource: __ReactDnd.DragSourceSpec<AddSignatureControlProps> = {
    beginDrag(props, monitor) {
        const { signatureId } = props;
        return {
            signatureId,
            type: Sign.DragAndDropTypes.ADD_SIGNATURE_TO_DOCUMENT
        };
    }
};

const dateSource: __ReactDnd.DragSourceSpec<AddDateControlProps> = {
    beginDrag(props, monitor) {
        return {
            type: Sign.DragAndDropTypes.ADD_DATE_TO_DOCUMENT,
            value: Moment().format('DD MMMM YYYY')
        };
    }
};



class AddSignatureControl extends React.PureComponent<AddSignatureControlProps> {
    componentDidMount() {
        // Use empty image as a drag preview so browsers don't draw it
        // and we can draw whatever we want on the custom drag layer instead.
        this.props.connectDragPreview(getEmptyImage(), {
          // IE fallback: specify that we'd rather screenshot the node
          // when it already knows it's being dragged so we can hide it with CSS.
          captureDraggingState: true,
        });
    }

    render() {
        const { isDragging } = this.props;
        if(this.props.signatureId){
            return this.props.connectDragSource(this.props.children);
        }
        return this.props.children;
    }
}


class AddDateControl extends React.PureComponent<AddDateControlProps> {
    componentDidMount() {
        // Use empty image as a drag preview so browsers don't draw it
        // and we can draw whatever we want on the custom drag layer instead.
        this.props.connectDragPreview(getEmptyImage(), {
          // IE fallback: specify that we'd rather screenshot the node
          // when it already knows it's being dragged so we can hide it with CSS.
          captureDraggingState: true,
        });

    }

    render() {
        const { isDragging } = this.props;
        return this.props.connectDragSource(this.props.children);
    }
}





const DraggableAddSignatureControl = DragSource(
    Sign.DragAndDropTypes.ADD_SIGNATURE_TO_DOCUMENT,
    signatureSource,
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    })
)(AddSignatureControl);


const DraggableAddDateControl = DragSource(
    Sign.DragAndDropTypes.ADD_DATE_TO_DOCUMENT,
    dateSource,
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    })
)(AddDateControl);


const dropTarget: __ReactDnd.DropTargetSpec<SignaturesPageWrapperProps> = {
    drop(props, monitor, pageComponent) {
        const item : any = monitor.getItem();
        const dropTargetBounds = monitor.getClientOffset();
        const pageBounds = findDOMNode(pageComponent).getBoundingClientRect()

        // Get the top left position of the signature on the page
        const sigantureX = dropTargetBounds.x - pageBounds.left;
        const sigantureY = dropTargetBounds.y - pageBounds.top;

        if(item.type === Sign.DragAndDropTypes.ADD_SIGNATURE_TO_DOCUMENT){
            const { signatureId } = item;
            Promise.all([imageRatio(signatureUrl(signatureId)), generateUUID()])
               .spread((xyRatio: number, signatureIndex: string) => {
                    // Find the centered position of the signature on the page
                    const width = Sign.DefaultSignatureSize.WIDTH_RATIO * props.containerWidth;
                    const height = width / xyRatio;
                    const centeredSignatureX = sigantureX - (width / 2);
                    const centeredSignatureY = sigantureY - (height / 2);

                    // Keep signature offsets within an expecptable bounds
                    const boundCenteredSignatureX = boundNumber(centeredSignatureX, 0, pageBounds.width - width);
                    const boundCenteredSignatureY = boundNumber(centeredSignatureY, 0, pageBounds.height - height);

                    // Convert the centered signature position to ratios
                    const signatureXOffset = boundCenteredSignatureX / pageBounds.width;
                    const signatureYOffset = boundCenteredSignatureY / pageBounds.height;

                    const ratioX = Sign.DefaultSignatureSize.WIDTH_RATIO;

                    const ratioY = (props.viewport.width / props.viewport.height) / xyRatio * ratioX;

                    props.addSignatureToDocument({
                        signatureIndex,
                        signatureId,
                        xyRatio,
                        documentId: props.documentId,
                        pageNumber: props.pageNumber,
                        offsetX: signatureXOffset,
                        offsetY: signatureYOffset,
                        ratioX,
                        ratioY
                    })
           })
       }
       else if(item.type === Sign.DragAndDropTypes.ADD_DATE_TO_DOCUMENT){
           generateUUID()
               .then((dateIndex) => {
                    const height = Sign.DefaultSignatureSize.TEXT_WIDTH_RATIO * props.containerWidth;
                    const canvas = stringToCanvas(height, item.value);
                    const width = canvas.width;
                    const xyRatio = width / height;
                    const dataUrl = canvas.toDataURL();
                    const centeredSignatureX = sigantureX - (width / 2);
                    const centeredSignatureY = sigantureY - (height / 2);

                    // Keep signature offsets within an expecptable bounds
                    const boundCenteredSignatureX = boundNumber(centeredSignatureX, 0, pageBounds.width - width);
                    const boundCenteredSignatureY = boundNumber(centeredSignatureY, 0, pageBounds.height - height);

                    // Convert the centered signature position to ratios
                    const signatureXOffset = boundCenteredSignatureX / pageBounds.width;
                    const signatureYOffset = boundCenteredSignatureY / pageBounds.height;

                    const ratioX = width / props.containerWidth;
                    const ratioY = (props.viewport.width / props.viewport.height) / xyRatio * ratioX;


                    props.addDateToDocument({
                        dateIndex,
                        value: item.value,
                        dataUrl,
                        documentId: props.documentId,
                        pageNumber: props.pageNumber,
                        offsetX: signatureXOffset,
                        offsetY: signatureYOffset,
                        ratioX,
                        ratioY
                    })

               })
       }
    }
};


class PDFPageWrapper extends React.PureComponent<PDFPageWrapperProps> {

    render() {
        const height = this.props.containerHeight;
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



const PDFPreviewDimensions = sizeMe({refreshRate: 300})(PDFPreview);


class PDFViewer extends React.PureComponent<ConnectedPDFViewerProps> {

    constructor(props: ConnectedPDFViewerProps) {
        super(props);
        this.setActivePage = this.setActivePage.bind(this);
        this.sign = this.sign.bind(this);
    }

    setActivePage(pageNumber: number) {
         this.props.setActivePage({
            documentId: this.props.documentId,
            pageNumber
        })
    }

    sign() {
        this.props.showSignConfirmationModal({ documentId: this.props.documentId, documentSetId: this.props.documentSetId })
    }

    render() {
        return (
            <div className='pdf-viewer'>
               <AutoAffix viewportOffsetTop={0} offsetTop={50}>
                    <div className="controls">
                        <div className="container">
                        <Row>
                            <Col xs={3}>
                            <DraggableAddSignatureControl signatureId={this.props.selectedSignatureId}>
                                    <div> <SignatureButton /></div>
                            </DraggableAddSignatureControl>
                            </Col>
                            <Col xs={3}>
                            <DraggableAddSignatureControl signatureId={this.props.selectedInitialId}>
                                    <div> <InitialButton /></div>
                            </DraggableAddSignatureControl>
                            </Col>
                            <Col xs={3}>

                            <DraggableAddDateControl >
                                    <div> <DateButton /></div>
                            </DraggableAddDateControl>

                            </Col>
                            <Col xs={3}>

                            <div className="signature-button" onClick={ this.sign }>
                                        <span className="fa fa-pencil" />
                                        <span>Sign Document</span>
                            </div>

                            </Col>
                            </Row>
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
                            <WidthSpy />
                            { Array(this.props.pageCount).fill(null).map((item: any, index: number) => {
                                const signaturesIndexes = Object.keys(this.props.signatures).filter(signatureIndex => this.props.signatures[signatureIndex].pageNumber === index &&
                                                                                                    this.props.signatures[signatureIndex].documentId === this.props.documentId);
                                const dateIndexes = Object.keys(this.props.dates).filter(dateIndex => this.props.dates[dateIndex].pageNumber === index &&
                                                                                                    this.props.dates[dateIndex].documentId === this.props.documentId);

                                return (
                                        <div className="page-separator" key={index}>
                                    <DimensionedDropTargetSignaturesPageWrapper
                                        pageNumber={index}
                                        documentId={this.props.documentId}
                                        signaturesIndexes={signaturesIndexes}
                                        dateIndexes={dateIndexes}
                                        textIndexes={[]}
                                        promptIndexes={[]}
                                        addSignatureToDocument={this.props.addSignatureToDocument}
                                        addDateToDocument={this.props.addDateToDocument}
                                        selectedSignatureId={this.props.selectedSignatureId}
                                        viewport={this.props.pageViewports[index] || {height: 1, width: 1}}>
                                        <PDFPageWrapper documentId={this.props.documentId} pageNumber={index}  setActivePage={this.setActivePage} viewport={this.props.pageViewports[index] || {height: 1, width: 1}}/>
                                    </DimensionedDropTargetSignaturesPageWrapper>
                                    </div>
                                );
                            })}
                       </Col>
                    </Row>
                </div>
            </div>
        );
    }
}



interface SignaturesPageWrapperProps {
    pageNumber: number;
    documentId: string;
    signaturesIndexes: string[];
    dateIndexes: string[];
    textIndexes: string[];
    promptIndexes: string[];
    selectedSignatureId?: number;
    addSignatureToDocument: (data: Sign.Actions.AddSignatureToDocumentPayload) => void;
    addDateToDocument: (data: Sign.Actions.AddDateToDocumentPayload) => void;
    connectDropTarget?: Function;
    isOver?: boolean;
    containerWidth: number;
    viewport: Sign.Viewport;
}

class SignaturesPageWrapper extends React.PureComponent<SignaturesPageWrapperProps> {
    constructor(props: SignaturesPageWrapperProps) {
        super(props);
        //this.addSelected = this.addSelected.bind(this);
    }

    // TODO: Remove when we no longer want click to add
    /*addSelected(e: React.MouseEvent<HTMLElement>) {
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        if (this.props.selectedSignatureId && target.tagName==='CANVAS') { // lolololol
            return generateUUID()
                .then((id) => {
                    this.props.addSignatureToDocument({
                        signatureIndex: id,
                        documentId: this.props.documentId,
                        signatureId: this.props.selectedSignatureId,
                        pageNumber: this.props.pageNumber,
                        xOffset: offsetX / rect.width,
                        yOffset: offsetY / rect.height,
                        xyRatio: 1
                    })
            })
        }
    }*/

    render() {
        const width = this.props.containerWidth;
        const height = ((width / this.props.viewport.width) * this.props.viewport.height) | 0;
        const child = React.cloneElement(React.Children.only(this.props.children), { ref: 'pdf-page', containerWidth: width, containerHeight: height});
        let className = "signature-wrapper ";
        if(this.props.isOver){
            className += 'over'
        }
        const body = (
            <div className={className} style={{position: 'relative'}}>
               {  this.props.signaturesIndexes.map(signatureIndex => <SignaturePositionable key={signatureIndex} index={signatureIndex} page={this.refs['pdf-page']} containerWidth={this.props.containerWidth}  containerHeight={height}/>)}
               {  this.props.dateIndexes.map(dateIndex => <DatePositionable key={dateIndex} index={dateIndex} page={this.refs['pdf-page']} containerWidth={this.props.containerWidth}  containerHeight={height}/>)}
                { child }
            </div>
        );
        return this.props.connectDropTarget(body);
    }
}

const DropTargetSignaturesPageWrapper = DropTarget(
    [
        Sign.DragAndDropTypes.ADD_SIGNATURE_TO_DOCUMENT,
        Sign.DragAndDropTypes.ADD_DATE_TO_DOCUMENT,
        Sign.DragAndDropTypes.ADD_TEXT_TO_DOCUMENT,
        Sign.DragAndDropTypes.ADD_PROMPT_TO_DOCUMENT
     ],
    dropTarget,
    (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    })
)(SignaturesPageWrapper);


const DimensionedDropTargetSignaturesPageWrapper = connect((state : Sign.State) => ({
    containerWidth: state.dimensions.width
}))(DropTargetSignaturesPageWrapper)


const ConnectedPDFViewer = connect(
    (state: Sign.State, ownProps: PDFViewerProps) => {
        return {
            pageCount: state.documents[ownProps.documentId] ? state.documents[ownProps.documentId].pageCount : 1,
            pageViewports: (state.documents[ownProps.documentId] ? state.documents[ownProps.documentId].pageViewports || [] : []) as Sign.Viewport[],
            signatures: state.documentViewer.signatures,
            dates: state.documentViewer.dates,
            signRequestStatus: state.documentViewer.signRequestStatus,
            selectedSignatureId: state.documentViewer.selectedSignatureId,
            selectedInitialId: state.documentViewer.selectedInitialId
    };
}, { signDocument, addSignatureToDocument, addDateToDocument, setActivePage, showSignConfirmationModal }
)(PDFViewer);





export default ConnectedPDFViewer;