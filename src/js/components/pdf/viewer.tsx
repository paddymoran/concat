import * as React from 'react';
import { findDOMNode } from 'react-dom';
import * as Promise from 'bluebird';
import { Button, Modal } from 'react-bootstrap';
import PDFPreview from './preview';
import PDFPage from './page';
import { connect } from 'react-redux';
import { findSetForDocument } from '../../utils';
import {  moveSignature, addSignatureToDocument, addDateToDocument, addTextToDocument,
    addPromptToDocument, setActivePage, showSignConfirmationModal, saveDocumentView, viewDocument   } from '../../actions';
import { SignaturePositionable, DatePositionable, TextPositionable, PromptPositionable, RequestPrompt} from '../positionable';
import * as AutoAffix from 'react-overlays/lib/AutoAffix'
import { Col, Row } from 'react-bootstrap';
import LazyLoad from 'react-lazy-load';
import sizeMe from 'react-sizeme';
import { signatureUrl, boundNumber, imageRatio, stringToCanvas, textDefaults, dateDefaults, massageDefaultPrompts, fileSize } from '../../utils';
import { generateUUID } from '../uuid';
import { Controls } from '../controls'
import { DropTarget } from 'react-dnd';
import * as Waypoint from 'react-waypoint';
import WidthSpy from '../widthSpy'
import { CSSTransitionGroup } from 'react-transition-group';


Promise.config({ cancellation: true });

interface PDFViewerProps {
    documentId: string;
    documentSetId: string;
    requestedSignatureInfo?: Sign.RequestedSignatureDocumentInfo;
    isDocumentOwner: boolean;
}

interface ConnectedPDFViewerProps extends PDFViewerProps {
    pageCount: number;
    pageViewports: Sign.Viewport[];
    signatures: Sign.DocumentSignatures;
    dates: Sign.DocumentDates;
    texts: Sign.DocumentTexts;
    prompts: Sign.DocumentPrompts;
    signRequestStatus: Sign.DownloadStatus;
    selectedSignatureId: number;
    selectedInitialId: number;
    addSignatureToDocument: (data: Sign.Actions.AddSignatureToDocumentPayload) => void;
    addDateToDocument: (data: Sign.Actions.AddDateToDocumentPayload) => void;
    addTextToDocument: (data: Sign.Actions.AddTextToDocumentPayload) => void;
    addPromptToDocument: (data: Sign.Actions.AddPromptToDocumentPayload) => void;
    setActivePage: (payload: Sign.Actions.SetActivePagePayload) => void;
    showSignConfirmationModal: (payload: Sign.Actions.ShowSignConfirmationModalPayload) => void;
    saveDocumentView: (payload: Sign.Actions.SaveDocumentViewPayload) => void;
    viewDocument: (payload: Sign.Actions.ViewDocumentPayload) => void;
}

interface PDFPageWrapperProps {
    documentId: string;
    viewport: Sign.Viewport;
    pageNumber: number;
    containerWidth?: number;
    containerHeight?: number;
    setActivePage: Function;
}


const dropTarget: __ReactDnd.DropTargetSpec<OverlayPageWrapperProps> = {
    drop(props, monitor, pageComponent) {
        const item : any = monitor.getItem();
        const dropTargetBounds = monitor.getClientOffset();
        const pageBounds = findDOMNode(pageComponent).getBoundingClientRect()

        // Get the top left position of the signature on the page
        const posX = dropTargetBounds.x - pageBounds.left;
        const posY = dropTargetBounds.y - pageBounds.top;
        const { documentId, pageNumber, containerWidth, viewport } = props;
        if(item.type === Sign.DragAndDropTypes.ADD_SIGNATURE_TO_DOCUMENT){
            const { signatureId } = item;
            Promise.all([imageRatio(signatureUrl(signatureId)), generateUUID()])
               .spread((xyRatio: number, signatureIndex: string) => {
                    // Find the centered position of the signature on the page
                    const width = Sign.DefaultSignatureSize.WIDTH_RATIO * containerWidth;
                    const height = width / xyRatio;
                    props.addSignatureToDocument({
                        signatureIndex,
                        signatureId,
                        xyRatio,
                        documentId: props.documentId,
                        pageNumber: props.pageNumber,
                         ...boundPositioning({width, height, posX, posY, pageBounds, viewport, containerWidth})
                    });
           })
       }
       else if(item.type === Sign.DragAndDropTypes.ADD_DATE_TO_DOCUMENT || item.type === Sign.DragAndDropTypes.ADD_TEXT_TO_DOCUMENT){
           generateUUID()
               .then((index) => {
                    const height = Math.round(Sign.DefaultSignatureSize.TEXT_WIDTH_RATIO * props.containerWidth);
                    const canvas = stringToCanvas(height, item.value, Sign.DefaultSignatureSize.MIN_WIDTH);
                    const width = canvas.width;
                    if(item.type === Sign.DragAndDropTypes.ADD_DATE_TO_DOCUMENT){
                         props.addDateToDocument({
                            value: item.value,
                            timestamp: item.timestamp,
                            format: item.format,
                            height,
                            dateIndex: index,
                            documentId: props.documentId,
                            pageNumber: props.pageNumber,
                             ...boundPositioning({width, height, posX, posY, pageBounds, viewport, containerWidth})
                        });
                     }
                    else{
                        props.addTextToDocument({
                            value: item.value,
                            height,
                            textIndex: index,
                            documentId: props.documentId,
                            pageNumber: props.pageNumber,
                             ...boundPositioning({width, height, posX, posY, pageBounds, viewport, containerWidth})
                        });
                    }

               })
       }
       else if (item.type === Sign.DragAndDropTypes.ADD_PROMPT_TO_DOCUMENT){
            generateUUID()
               .then((index) => {
                    const width = Sign.DefaultSignatureSize.WIDTH_RATIO * containerWidth;
                    const height = width / 3;
                    props.addPromptToDocument({
                        value: item.value,
                        promptIndex: index,
                        documentId: props.documentId,
                        pageNumber: props.pageNumber,
                         ...boundPositioning({width, height, posX, posY, pageBounds, viewport, containerWidth})
                    });
           });
       }
    }
};

interface DocumentLoadingProps {
    loading: boolean;
    progress: number;
    size: number;
}

class UnconnectedDocumentLoading extends React.PureComponent<DocumentLoadingProps>{
    render() {
        const progress = this.props.size ? `${fileSize((this.props.progress * this.props.size) || 0)} / ${fileSize(this.props.size)}` : '';
        return  <div className="document-loading">
            <CSSTransitionGroup transitionName="progress" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                { this.props.loading && <p className="text-center">Loading Document { progress } </p> }
                    { this.props.loading && <div className="progress" key="progress">
                        <div className="progress-bar progress-bar-striped active" style={{width: `${this.props.progress*100}%`}}></div>
                    </div> }
            </CSSTransitionGroup>
            </div>
    }
}

const DocumentLoading = connect((state: Sign.State, ownProps: any) => {
    const document = state.documents[ownProps.documentId]
    return {
        loading: document && (document.readStatus === Sign.DocumentReadStatus.NotStarted || document.readStatus === Sign.DocumentReadStatus.InProgress),
        progress: document && document.downloadProgress,
        size: document && document.size
    }
})(UnconnectedDocumentLoading)

class PDFPageWrapper extends React.PureComponent<PDFPageWrapperProps> {

    render() {
        let  height = this.props.containerHeight;
        let className = "pdf-page-wrapper ";
        if(!this.props.containerWidth){
            return false;
        }
        if(height) {
            className += "loaded"
        }
        else{
            height = this.props.containerWidth * Math.sqrt(2);
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

type SourceIds =  {[index: string] : boolean};

const PDFPreviewDimensions = sizeMe<Sign.Components.PDFPreviewProps>({refreshRate: 300})(PDFPreview);


class PDFViewer extends React.PureComponent<ConnectedPDFViewerProps> {

    constructor(props: ConnectedPDFViewerProps) {
        super(props);
        this.setActivePage = this.setActivePage.bind(this);
        this.save = this.save.bind(this);
    }

    componentDidMount() {
        this.props.viewDocument({documentId: this.props.documentId, documentSetId: this.props.documentSetId});
    }

    componentDidUpdate(oldProps: ConnectedPDFViewerProps) {
        if(this.props.documentId !== oldProps.documentId){
            this.props.viewDocument({documentId: this.props.documentId, documentSetId: this.props.documentSetId});
        }
    }

    setActivePage(pageNumber: number) {
         this.props.setActivePage({
            documentId: this.props.documentId,
            pageNumber
        })
    }


    save() {
        this.props.saveDocumentView({documentSetId: this.props.documentSetId, documentId: this.props.documentId})
    }

    collectRequestPrompts() {
        const sourceIds : SourceIds = {};
        Object.keys(this.props.signatures).reduce((acc : SourceIds, k) => {
            acc[this.props.signatures[k].sourceRequestPromptIndex] = true;
            return acc;
        }, sourceIds);
        Object.keys(this.props.dates).reduce((acc : SourceIds, k) => {
            acc[this.props.dates[k].sourceRequestPromptIndex] = true;
            return acc;
        }, sourceIds);
        Object.keys(this.props.texts).reduce((acc : SourceIds, k) => {
            acc[this.props.texts[k].sourceRequestPromptIndex] = true;
            return acc;
        }, sourceIds);
        let requestPrompts : Sign.DocumentPrompt[] = null;
        if(this.props.requestedSignatureInfo && this.props.requestedSignatureInfo.prompts){
            const prompts : Sign.DocumentPrompt[] = this.props.requestedSignatureInfo.prompts;
            requestPrompts = prompts
                .filter((prompt : Sign.DocumentPrompt) =>  prompt.documentId === this.props.documentId)
                .filter((prompt : Sign.DocumentPrompt) => !sourceIds[prompt.promptIndex])
            return requestPrompts;
        }
    }

    render() {

        const requestPrompts = this.collectRequestPrompts();

        return (
            <div className='pdf-viewer'>
               <AutoAffix viewportOffsetTop={0} offsetTop={50}>
                   <div  className="controls-affix">
                        <Controls isDocumentOwner={this.props.isDocumentOwner} requestPrompts={requestPrompts} documentId={this.props.documentId} requestedSignatureInfo={this.props.requestedSignatureInfo} documentSetId={this.props.documentSetId} />
                   </div>
                </AutoAffix>

                <div className='pdf-container container'>
                    <Row>
                        <Col lg={2} xsHidden={true} smHidden={true} mdHidden={true}  >
                            <AutoAffix viewportOffsetTop={50} offsetTop={0}  bottomClassName="bottom" affixClassName="affixed" >
                                <div>
                                    <PDFPreviewDimensions documentId={this.props.documentId} width={120}  pageViewports={this.props.pageViewports} pageCount={this.props.pageCount} />
                                </div>
                            </AutoAffix>
                        </Col>
                        <Col lg={10} md={12} className="page-list">
                            <WidthSpy />
                            <DocumentLoading documentId={this.props.documentId} />
                            { Array(this.props.pageCount).fill(null).map((item: any, index: number) => {
                                const signaturesIndexes = Object.keys(this.props.signatures).filter(signatureIndex => this.props.signatures[signatureIndex].pageNumber === index &&
                                                                                                    this.props.signatures[signatureIndex].documentId === this.props.documentId);
                                const dateIndexes = Object.keys(this.props.dates).filter(dateIndex => this.props.dates[dateIndex].pageNumber === index &&
                                                                                                    this.props.dates[dateIndex].documentId === this.props.documentId);
                                const textIndexes = Object.keys(this.props.texts).filter(textIndex => this.props.texts[textIndex].pageNumber === index &&
                                                                                                    this.props.texts[textIndex].documentId === this.props.documentId);
                                const promptIndexes = Object.keys(this.props.prompts).filter(textIndex => this.props.prompts[textIndex].pageNumber === index &&
                                                                                                    this.props.prompts[textIndex].documentId === this.props.documentId);

                                const filteredRequestPrompts = requestPrompts && requestPrompts.filter((r : Sign.DocumentPrompt) => r.pageNumber === index);
                                return (
                                        <div className="page-separator" key={index}>
                                    <DimensionedDropTargetSignaturesPageWrapper
                                        pageNumber={index}
                                        documentId={this.props.documentId}
                                        documentSetId={this.props.documentSetId}
                                        signaturesIndexes={signaturesIndexes}
                                        dateIndexes={dateIndexes}
                                        textIndexes={textIndexes}
                                        promptIndexes={promptIndexes}
                                        requestPrompts={filteredRequestPrompts}
                                        addSignatureToDocument={this.props.addSignatureToDocument}
                                        addDateToDocument={this.props.addDateToDocument}
                                        addTextToDocument={this.props.addTextToDocument}
                                        addPromptToDocument={this.props.addPromptToDocument}
                                        viewport={this.props.pageViewports[index] || {height: 0, width: 1}}>
                                        <PDFPageWrapper documentId={this.props.documentId}
                                            pageNumber={index}
                                            setActivePage={this.setActivePage}
                                            viewport={this.props.pageViewports[index] || {height: 0, width: 1}}/>
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

interface PositioningArgs{
    width: number,
    height: number,
    posX: number,
    posY :number,
    pageBounds: Sign.Viewport,
    viewport: Sign.Viewport,
    containerWidth: number
}

interface PositioningResult{
    offsetX: number,
    offsetY: number,
    ratioX: number,
    ratioY: number,
}

function boundPositioning(args: PositioningArgs) : PositioningResult {
    const { width, height, posX, posY, pageBounds, viewport, containerWidth } = args;
    const centeredX = posX - (width / 2);
    const centeredY = posY - (height / 2);
    // Keep signature offsets within an expecptable bounds
    const boundCenteredSignatureX = boundNumber(centeredX, 0, pageBounds.width - width);
    const boundCenteredSignatureY = boundNumber(centeredY, 0, pageBounds.height - height);
    // Convert the centered signature position to ratios
    const offsetX = boundCenteredSignatureX / pageBounds.width;
    const offsetY = boundCenteredSignatureY / pageBounds.height;
    const ratioX = width / containerWidth;
    const xyRatio = width / height;
    const ratioY = (viewport.width / viewport.height) / xyRatio * ratioX;
    return {offsetX, offsetY, ratioX, ratioY}
}

interface UnconnectedOverlayPageWrapperProps   {
    pageNumber: number;
    documentId: string;
    documentSetId: string;
    signaturesIndexes: string[];
    dateIndexes: string[];
    textIndexes: string[];
    promptIndexes: string[];
    requestPrompts?: Sign.DocumentPrompt[]
    selectedSignatureId?: number;
    selectedInitialId?: number;
    addSignatureToDocument: (data: Sign.Actions.AddSignatureToDocumentPayload) => void;
    addDateToDocument: (data: Sign.Actions.AddDateToDocumentPayload) => void;
    addTextToDocument: (data: Sign.Actions.AddTextToDocumentPayload) => void;
    addPromptToDocument: (data: Sign.Actions.AddPromptToDocumentPayload) => void;
    viewport: Sign.Viewport;
}


interface OverlayPageWrapperProps extends UnconnectedOverlayPageWrapperProps{
    connectDropTarget?: Function;
    isOver?: boolean;
    containerWidth: number;
    activeSignControl: Sign.SignControl;
    overlayDefaults: Sign.OverlayDefaults;
    recipients: Sign.Recipients;
}




class UnconnectedOverlayPageWrapper extends React.PureComponent<OverlayPageWrapperProps> {
    constructor(props: OverlayPageWrapperProps) {
        super(props);
        this.addSelected = this.addSelected.bind(this);
    }

    addSelected(e: React.MouseEvent<HTMLElement>) {

        if (this.props.activeSignControl === Sign.SignControl.NONE) {
            return;
        }
        const target = e.target as HTMLElement;
        if (target.tagName==='CANVAS') { // lolololol
            const pageBounds = target.getBoundingClientRect();
            const posX = e.clientX - pageBounds.left;
            const posY = e.clientY - pageBounds.top;
            const { documentId, pageNumber, selectedSignatureId, selectedInitialId, containerWidth, viewport } = this.props;
            return  generateUUID()
                .then((id) => {
                    switch(this.props.activeSignControl){
                        case Sign.SignControl.SIGNATURE:
                        case Sign.SignControl.INITIAL:
                            const signatureId = this.props.activeSignControl === Sign.SignControl.SIGNATURE ? selectedSignatureId : selectedInitialId;
                            return imageRatio(signatureUrl(signatureId))
                                .then((xyRatio: number) => {
                                    const width = Sign.DefaultSignatureSize.WIDTH_RATIO * containerWidth;
                                    const height = width / xyRatio;
                                    return this.props.addSignatureToDocument({
                                        signatureIndex: id,
                                        signatureId,
                                        xyRatio,
                                        documentId,
                                        pageNumber,
                                        ...boundPositioning({width, height, posX, posY, pageBounds, viewport, containerWidth})
                                    });
                                })
                        case Sign.SignControl.DATE:
                            {
                                let { value, timestamp, format } = dateDefaults();
                                if(this.props.overlayDefaults.date){
                                    if(this.props.overlayDefaults.date.value){
                                        value = this.props.overlayDefaults.date.value;
                                    }
                                    if(this.props.overlayDefaults.date.format){
                                        format = this.props.overlayDefaults.date.format;
                                    }
                                    if(this.props.overlayDefaults.date.timestamp){
                                        timestamp = this.props.overlayDefaults.date.timestamp;
                                    }
                                }
                                const height = Math.round(Sign.DefaultSignatureSize.TEXT_WIDTH_RATIO * containerWidth);
                                const canvas = stringToCanvas(height, value);
                                const width = canvas.width;
                                return this.props.addDateToDocument({
                                    value,
                                    timestamp,
                                    format,
                                    height,
                                    dateIndex: id,
                                    documentId,
                                    pageNumber,
                                     ...boundPositioning({width, height, posX, posY, pageBounds, viewport, containerWidth})
                                });
                            }
                        case Sign.SignControl.TEXT:
                            {
                                let { value } = textDefaults();
                                if(this.props.overlayDefaults.text){
                                    if(this.props.overlayDefaults.text.value){
                                        value = this.props.overlayDefaults.text.value;
                                    }
                                }
                                const height = Math.round(Sign.DefaultSignatureSize.TEXT_WIDTH_RATIO * containerWidth);
                                const canvas = stringToCanvas(height, value);
                                const width = canvas.width;
                                return this.props.addTextToDocument({
                                    value,
                                    height,
                                    textIndex: id,
                                    documentId,
                                    pageNumber,
                                     ...boundPositioning({width, height, posX, posY, pageBounds, viewport, containerWidth})
                                });
                            }
                        case Sign.SignControl.PROMPT:
                            {
                                let value = {type: 'signature'};
                                if(this.props.overlayDefaults.prompt){
                                    if(this.props.overlayDefaults.prompt.value){
                                        value = this.props.overlayDefaults.prompt.value;
                                    }
                                }
                                const width = Sign.DefaultSignatureSize.WIDTH_RATIO * containerWidth;
                                const height = width  / 3;
                                return this.props.addPromptToDocument({
                                    value,
                                    promptIndex: id,
                                    documentId,
                                    pageNumber,
                                     ...boundPositioning({width, height, posX, posY, pageBounds, viewport, containerWidth})
                                });
                            }
                    }
                });
        }
    }

    render() {
        const width = this.props.containerWidth;
        const height = ((width / this.props.viewport.width) * this.props.viewport.height) | 0;
        const child = React.cloneElement(React.Children.only(this.props.children), { ref: 'pdf-page', containerWidth: width, containerHeight: height});
        let className = "signature-wrapper ";
        if(this.props.isOver){
            className += 'over'
        }
        const props ={
            page: this.refs['pdf-page'],
            containerWidth: this.props.containerWidth,
            containerHeight: height,
            documentSetId: this.props.documentSetId,
            documentId: this.props.documentId
        };
        const body = (
            <div className={className} style={{position: 'relative'}} onClick={this.addSelected}>
               {  !!height && this.props.signaturesIndexes.map(signatureIndex => <SignaturePositionable key={signatureIndex} index={signatureIndex} {...props} />)}
               {  !!height && this.props.dateIndexes.map(dateIndex => <DatePositionable key={dateIndex} index={dateIndex} {...props} />) }
               {  !!height && this.props.textIndexes.map(textIndex => <TextPositionable key={textIndex} index={textIndex}  {...props} />)}
               {  !!height && this.props.promptIndexes.map(promptIndex => <PromptPositionable key={promptIndex} index={promptIndex}  {...props} />)}
               {  !!height && this.props.requestPrompts && this.props.requestPrompts.map((requestPrompt) => <RequestPrompt key={requestPrompt.promptIndex} requestPrompt={requestPrompt} {...props}  />) }
                { child }
            </div>
        );
        return this.props.connectDropTarget(body);
    }
}


const OverlayPageWrapper = connect<{}, {}, OverlayPageWrapperProps>(
    (state: Sign.State, ownProps: UnconnectedOverlayPageWrapperProps) => {
        const overlayDefaults = massageDefaultPrompts(state.overlayDefaults, state.documentSets[ownProps.documentSetId]);

        return {
            selectedSignatureId: state.documentViewer.selectedSignatureId,
            selectedInitialId: state.documentViewer.selectedInitialId,
            activeSignControl: state.documentViewer.activeSignControl,
            overlayDefaults: overlayDefaults
        }
    }
)(UnconnectedOverlayPageWrapper);

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
)(OverlayPageWrapper);


const DimensionedDropTargetSignaturesPageWrapper = connect((state : Sign.State, ownProps) => ({
    containerWidth: state.dimensions.width,
}))(DropTargetSignaturesPageWrapper) as any; // hack to remove errors


const ConnectedPDFViewer = connect(
    (state: Sign.State, ownProps: PDFViewerProps) => {
        return {
            pageCount: state.documents[ownProps.documentId] ? state.documents[ownProps.documentId].pageCount : 1,
            pageViewports: (state.documents[ownProps.documentId] ? state.documents[ownProps.documentId].pageViewports || [] : []) as Sign.Viewport[],
            signatures: state.documentViewer.signatures,
            dates: state.documentViewer.dates,
            texts: state.documentViewer.texts,
            prompts: state.documentViewer.prompts,
            signRequestStatus: state.documentViewer.signRequestStatus,
            selectedSignatureId: state.documentViewer.selectedSignatureId,
            selectedInitialId: state.documentViewer.selectedInitialId,
    };
}, { addSignatureToDocument, addDateToDocument, addTextToDocument, addPromptToDocument, setActivePage, showSignConfirmationModal, saveDocumentView, viewDocument }
)(PDFViewer);





export default ConnectedPDFViewer;