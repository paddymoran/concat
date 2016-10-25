import * as React from "react";
import { findDOMNode } from "react-dom";
import SignatureCanvas from 'react-signature-canvas'
import { Button, Modal, Tabs, Tab } from 'react-bootstrap';

interface SignatureSelectorProps {
    isVisible: boolean;
    signatureURLs?: Array<string>;
    onSignatureSelected: Function;
    showModal: Function;
    hideModal: Function;
}

const SELECT_SIGNATURE_TAB = 1;
const DRAW_SIGNATURE_TAB = 2;

export default class SignatureSelector extends React.Component<SignatureSelectorProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            selectedSignature: 0,
            currentTab: SELECT_SIGNATURE_TAB
        };
    }

    changeTab(newTab) {
        this.setState({ currentTab: newTab });
    }

    changeSelectedSignature(key) {
        this.setState({ selectedSignature: key });
    }

    clearCanvas() {
        const signatureCanvas = this.refs['signature-canvas'];
        signatureCanvas.clear();
    }

    select() {
        let signature;

        if (this.state.currentTab == SELECT_SIGNATURE_TAB) {
            signature = this.props.signatureURLs[this.state.selectedSignature];
        } else {
            const signatureCanvas = this.refs['signature-canvas'];

            const signatureContext = signatureCanvas.getTrimmedCanvas().getContext('2d');
            const width = signatureContext.canvas.width;
            const height = signatureContext.canvas.height;

            //signature = signatureContext.getImageData(0, 0, width, height);
            signature = signatureCanvas.getTrimmedCanvas().toDataURL();
        }

        this.props.onSignatureSelected(signature);
    }

    render() {
        const signatureCanvasOptions = {
            width: 500,
            height: 200,
            className: 'signature-drawer'
        };

        return (
            <div>
                <button className="btn btn-primary" onClick={() => this.props.showModal()}>
                    Launch demo modal
                </button>

                <Modal show={this.props.isVisible} onHide={() => this.props.hideModal()}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select Signature</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs activeKey={this.state.currentTab} onSelect={this.changeTab.bind(this)} animation={false} id='select-signature-tabs'>
                            <Tab eventKey={SELECT_SIGNATURE_TAB} title="Select Signature" className="select-signature">
                                <div className="row">
                                    {this.props.signatureURLs.map((url, i) => {
                                            let classes = 'img-responsive selectable';
                                            classes += i == this.state.selectedSignature ? ' selected' : '';

                                            return (
                                                <div className="col-sm-6" key={i} onClick={() => this.changeSelectedSignature(i) }>
                                                    <img className={classes} src={url} />
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </Tab>

                            <Tab eventKey={DRAW_SIGNATURE_TAB} title="Draw Signature">
                                <div className='signature-canvas-conatiner clearfix'>
                                    <SignatureCanvas canvasProps={signatureCanvasOptions} ref='signature-canvas' />
                                    <a className='pull-right' onClick={this.clearCanvas.bind(this)}>Clear</a>
                                </div>
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.props.hideModal()}>Close</Button>
                        <Button bsStyle='primary' onClick={this.select.bind(this)} >Select</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}
