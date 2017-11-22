import  * as React from "react";
import * as Promise from 'bluebird';
import SignatureCanvas from 'react-signature-canvas';
import { Alert, Button, Tab, Tabs } from 'react-bootstrap';
import SignatureUpload from './signatureUpload';
import { uploadSignature, selectSignature, selectInitial, showSignatureSelection,  deleteSignature,
    addSignatureToDocument, requestSignatures, closeModal, showInitialSelectionModal, setActiveSignControl } from '../actions/index';
import { connect } from 'react-redux';
import Loading from './loading';
import { signatureUrl, signatureCanvasMinDimensions, signatureToCanvas  } from '../utils';
import sizeMe from 'react-sizeme';
import Modal from './modals/modal';
import * as WebFontLoader from 'webfontloader';




interface SignatureSelectorProps {
    uploading: boolean;
    loadStatus: Sign.DownloadStatus;
    ids: number[];
    selectedId: number;
    title: string;
    closeModal: () => void;
    selectSignature: (id: number) => void;
    uploadSignature: (data: string) => void;
    deleteSignature: (signatureId: number) => void;
    addSignatureToDocument: (payload: Sign.Actions.AddSignatureToDocumentPayload) => void;
    setActiveSignControl: () => void;
    requestSignatures: () => void;
    username: string;
}

interface SignatureSelectorState {
    currentTab: number;
    signatureUploaderErrors?: string
}

const SELECT_SIGNATURE_TAB = 1;
const TEXT_SIGNATURE_TAB = 2;
const DRAW_SIGNATURE_TAB = 3;
const UPLOAD_SIGNATURE_TAB = 4;

const fonts = ["Alex Brush", "Allura", "Caveat", "Courgette", "Damion", "Dancing Script", "Great Vibes", "Sacramento", "Tangerine", "Yellowtail"]


function loadFonts() {
    return new Promise((resolve, reject) => {
        const WebFontConfig = {
            google: {
                families: fonts
            },
            active: function(){
                resolve()
            },
            inactive: function(){
                reject();
            }
        }
        WebFontLoader.load(WebFontConfig)
    })
}

interface TextSignatureCanvasProps {
    username: string;
    canvasProps: {
        width: number;
        height: number;
    }
}


export class SignatureText extends React.PureComponent<{font: string, text: string}> {

    render() {
        const canvas = signatureToCanvas(200, this.props.text, this.props.font);
        return <div style={{width: '100%', height:'200px'}}>
            <img src={canvas.toDataURL()}  style={{maxWidth: '100%'}}/>
        </div>
    }
}

export class TextSignatureCanvas extends React.PureComponent<TextSignatureCanvasProps, {font: string, text: string}> {

    constructor(props: TextSignatureCanvasProps) {
        super(props);
        this.changeText = this.changeText.bind(this);
        this.changeFont = this.changeFont.bind(this);
        this.state = {font: fonts[0], text: props.username}
    }

    changeText(event: React.FormEvent<HTMLInputElement>) {
        this.setState({text: event.currentTarget.value});

    }

    changeFont(event : React.FormEvent<HTMLSelectElement>) {
        this.setState({font: event.currentTarget.value});
    }


    getTrimmedCanvas() {
        return signatureToCanvas(200, this.state.text, this.state.font);
    }

    render() {
        return <div>
            <SignatureText {...this.state} />
            <div className="form-group">
            <label>Text</label>
            <input className="form-control" value={this.state.text} onChange={this.changeText}/>
            </div>
            <div className="form-group">
            <label>Font</label>
            <select className="form-control" value={this.state.font} onChange={this.changeFont}>
                { fonts.map((font, i) => {
                    return <option key={i} value={font}>{ font } </option>
                }) }
            </select>
            </div>
        </div>
    }
}



interface DrawingCanvasProps {
    size: {width: number};
    innerRef: (ref: DrawingCanvas) => void;
}


export class DrawingCanvas extends React.PureComponent<DrawingCanvasProps> {
    private signatureCanvas: SignatureCanvas;

    clearCanvas() {
        this.signatureCanvas.clear();
    }

    componentDidMount(){
        this.props.innerRef && this.props.innerRef(this);

    }

    componentWillUnmount(){
        this.props.innerRef && this.props.innerRef(undefined);

    }

    toDataUrl() {
        return signatureCanvasMinDimensions(this.signatureCanvas.getTrimmedCanvas()).toDataURL();
    }

    render() {
        const canvasProps = {
            width: this.props.size.width,
            height: 200
        }
        return <div className='signature-display'>
            <SignatureCanvas canvasProps={canvasProps} ref={(ref: SignatureCanvas) => this.signatureCanvas = ref}/>
            <a className='btn btn-default btn-block' onClick={this.clearCanvas.bind(this)}>Clear</a>
        </div>

    }
}


interface TextCanvasProps {
    size: {width: number};
    innerRef: (ref: TextCanvas) => void;
    username: string;
}


export class TextCanvas extends React.PureComponent<TextCanvasProps, {loaded: boolean}> {
    private signatureCanvas: TextSignatureCanvas;
    private _unmounted: boolean;

    constructor(props: TextCanvasProps) {
        super(props);
        this.state = {loaded: false}
    }

    componentDidMount(){
        this.props.innerRef && this.props.innerRef(this);
        this._unmounted = false;
        loadFonts()
            .then(() => {
                !this._unmounted && this.setState({loaded: true});
            })
    }

    componentWillUnmount(){
        this.props.innerRef && this.props.innerRef(undefined);
        this._unmounted = true;
    }

    toDataUrl() {
        return signatureCanvasMinDimensions(this.signatureCanvas.getTrimmedCanvas()).toDataURL();
    }

    render() {
        const canvasProps = {
            width: this.props.size.width,
            height: 200
        }
        return <div className='signature-display'>
            { !this.state.loaded && <Loading /> }
            { this.state.loaded && <TextSignatureCanvas username={this.props.username} canvasProps={canvasProps} ref={(ref: TextSignatureCanvas) => this.signatureCanvas = ref}/> }
        </div>

    }
}


const DimensionedDrawingCanvas = sizeMe<{innerRef: (ref: DrawingCanvas) => void}>({refreshMode: 'debounce', monitorWidth: true})(DrawingCanvas);
const DimensionedTextCanvas = sizeMe<{innerRef: (ref: TextCanvas) => void, username: string}>({refreshMode: 'debounce', monitorWidth: true})(TextCanvas);



export class SignatureSelector extends React.PureComponent<SignatureSelectorProps, SignatureSelectorState> {
    private drawCanvas: DrawingCanvas ;
    private textCanvas: TextCanvas;

    constructor(props: SignatureSelectorProps) {
        super(props);
        this.deleteSignature = this.deleteSignature.bind(this);
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

    deleteSignature() {
        this.props.deleteSignature(this.props.selectedId);
        this.props.selectSignature(null);
    }

    select() {
        if (this.state.currentTab == UPLOAD_SIGNATURE_TAB) {
            const uploader = this.refs['signature-uploader']  as SignatureUpload;
            const signature = uploader.toDataURL();
            if (signature === null) {
                this.setState({ signatureUploaderErrors: 'Please upload a file' });
            }
            else {
                this.props.uploadSignature(signature);
            }
        }
        else if (this.state.currentTab == DRAW_SIGNATURE_TAB) {
            const signature = this.drawCanvas.toDataUrl();
            this.props.uploadSignature(signature);
        }
        else if (this.state.currentTab == TEXT_SIGNATURE_TAB) {
            const signature = this.textCanvas.toDataUrl();
            this.props.uploadSignature(signature);
        }

        this.props.setActiveSignControl();
        this.props.closeModal();
    }


    render() {
        return  (
            <Modal backdrop='static' show={true} onHide={this.props.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Select {this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs activeKey={this.state.currentTab} onSelect={this.changeTab.bind(this)} animation={false} id='select-signature-tabs'>
                        <Tab eventKey={SELECT_SIGNATURE_TAB} title={`Select`} className="select-signature">
                            <div className="row">
                                {this.props.loadStatus === Sign.DownloadStatus.InProgress && <Loading />}

                                {this.props.loadStatus === Sign.DownloadStatus.Complete && this.props.ids.map((id: number, i: number) => {
                                        let classes = 'col-sm-6 selectable';
                                        classes += id === this.props.selectedId ? ' selected' : '';

                                        return (
                                            <div className={classes} key={i} onClick={() => this.changeSelectedSignature(id) }>
                                                <img className='img-responsive' src={`/api/signatures/${id}`} />
                                            </div>
                                        )
                                    })
                                }

                                {this.props.loadStatus === Sign.DownloadStatus.Complete && this.props.ids.length == 0 &&
                                    <div className="col-xs-12">
                                        <div className="alert alert-warning"><p>This is the visual representation of your electronic {this.props.title.toLowerCase()}.  It can by anything, but most people like the image to look identical to their usual {this.props.title.toLowerCase()}.
                                        </p>
                                        <p>To draw your {this.props.title.toLowerCase()} click the <strong>Draw</strong> tab.</p>
                                        <p>To upload an image, or take a photo, click the <strong>Upload</strong> tab.</p>
                                        </div>
                                    </div>
                                }
                            </div>
                        </Tab>

                        <Tab eventKey={TEXT_SIGNATURE_TAB} title={`Type`}>
                            <div className='signature-canvas-container clearfix'>
                                { this.props.uploading && <Loading />}
                                { !this.props.uploading &&
                                   <DimensionedTextCanvas username={this.props.username} innerRef={(ref: TextCanvas) => this.textCanvas = ref} />
                                }
                            </div>
                        </Tab>

                        <Tab eventKey={DRAW_SIGNATURE_TAB} title={`Draw`}>
                            <div className='signature-canvas-container clearfix'>
                                { this.props.uploading && <Loading />}
                                { !this.props.uploading &&
                                   <DimensionedDrawingCanvas innerRef={(ref: DrawingCanvas) => this.drawCanvas = ref} />
                                }
                            </div>
                        </Tab>

                        <Tab eventKey={UPLOAD_SIGNATURE_TAB} title={`Upload`}>
                            <div className='signature-upload-container clearfix'>
                            { this.state.signatureUploaderErrors &&
                                <Alert bsStyle='danger'>
                                    { this.state.signatureUploaderErrors }
                                </Alert>
                            }
                                {this.props.uploading && <Loading />}
                                {!this.props.uploading && <SignatureUpload ref='signature-uploader' />}
                            </div>
                        </Tab>
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    { this.state.currentTab === SELECT_SIGNATURE_TAB && <Button bsStyle="warning" className="delete-signature" disabled={!this.props.selectedId} onClick={this.deleteSignature}>Delete {this.props.title}</Button> }
                    <Button onClick={this.props.closeModal}>Close</Button>
                    <Button bsStyle='primary' onClick={this.select.bind(this)} >Select</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
interface ModalButtonProps {
    active: boolean;
    setActive: () => void;
}

interface ConnectedModalButtonProps extends ModalButtonProps{
    selectedId: number;
    text: string;
    showModal: () => void;
    requestSignatures: () => void;
    className: string;
}

class ModalButton extends React.PureComponent<ConnectedModalButtonProps> {
    constructor(props: ConnectedModalButtonProps) {
        super(props);
        this.setActive = this.setActive.bind(this);
    }
    setActive(e: React.MouseEvent<HTMLElement>){
        e.stopPropagation();
        if(this.props.selectedId){
            this.props.setActive();
        }
        else{
            this.props.showModal();
        }
    }
    componentWillMount() {
        this.props.requestSignatures();
    }
    render(){
        const style : any = {};
        if(this.props.selectedId){
            style['backgroundImage'] = `url(${signatureUrl(this.props.selectedId)})`;
        }

        return (
            <div className={`sign-control sign-control-with-dropdown ${this.props.active ? 'active' : ''}  ${this.props.className}`} >
                <div className={`activate-sign-control ${this.props.active ? 'active' : ''}`} onClick={this.setActive}>
                    { this.props.selectedId && <div className="signature-image" style={style}></div> }
                    { !this.props.selectedId && <div className="signature-placeholder" >{ this.props.text }</div> }
                </div>

                <div className="sign-control-dropdown" onClick={this.props.showModal}>
                    <i className="fa fa-caret-down" />
                </div>
            </div>
        );
    }
}



export const SignatureButton = connect<{}, {}, ModalButtonProps>(
    (state: Sign.State) => ({
        text: 'Signature',
        className: 'signature-control',
        selectedId: state.documentViewer.selectedSignatureId
    }),
    {
        showModal: showSignatureSelection,
        requestSignatures
    }
)(ModalButton);

export const InitialButton = connect<{}, {}, ModalButtonProps>(
    (state: Sign.State) => ({
        text: 'Initial',
        className: 'initial-control',
        selectedId: state.documentViewer.selectedInitialId
    }),
    {
        showModal: showInitialSelectionModal,
        requestSignatures
    }
)(ModalButton);


export const SignatureModal = connect(
    (state: Sign.State) => ({
        uploading: false,
        loadStatus: state.signatures.status,
        ids: state.signatures.signatureIds,
        selectedId: state.documentViewer.selectedSignatureId,
        title: 'Signature',
        username: state.user.name
    }),
    {
        uploadSignature: (data: string) => uploadSignature({ data, type: Sign.SignatureType.SIGNATURE }),
        selectSignature,
        deleteSignature,
        addSignatureToDocument,
        requestSignatures,
        setActiveSignControl: () => setActiveSignControl({ activeSignControl: Sign.SignControl.SIGNATURE}),
        closeModal: () => closeModal({ modalName: 'selectSignature' })
    }
)(SignatureSelector);

export const InitialsModal = connect(
    (state: Sign.State) => ({
        uploading: false,
        loadStatus: state.signatures.status,
        ids: state.signatures.initialIds,
        selectedId: state.documentViewer.selectedInitialId,
        title: 'Initial',
        username: state.user.name
    }),
    {
        uploadSignature: (data: string) => uploadSignature({ data, type: Sign.SignatureType.INITIAL }),
        selectSignature: (initialId: number) => selectInitial({ initialId }),
        deleteSignature,
        addSignatureToDocument,
        requestSignatures,
        setActiveSignControl: () => setActiveSignControl({ activeSignControl: Sign.SignControl.INITIAL }),
        closeModal: () => closeModal({ modalName: 'selectInitial' })
    }
)(SignatureSelector);
