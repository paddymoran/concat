import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { closeModal, setActiveSignControl, saveDocumentView } from '../../actions';
import { connect } from 'react-redux';
import { connectControls, ControlProps, ConnectedControlProps } from '../controls';

class UnconnectedActivateControlModal extends React.PureComponent<ConnectedControlProps> {
    constructor(props: ConnectedControlProps) {
        super(props);

        this.activateSignature = this.activateSignature.bind(this);
        this.activateInitial = this.activateInitial.bind(this);
        this.activateDate = this.activateDate.bind(this);
        this.activateText = this.activateText.bind(this);
        this.activatePrompt = this.activatePrompt.bind(this);
        this.saveDraft = this.saveDraft.bind(this);
        this.showInviteModal = this.showInviteModal.bind(this);
        this.reject = this.reject.bind(this);
    }

    activateSignature() {
        this.props.activateSignature();
        this.props.closeActivateControlModal();
    }

    activateInitial() {
        this.props.activateInitial();
        this.props.closeActivateControlModal();
    }

    activateDate() {
        this.props.activateDate();
        this.props.closeActivateControlModal();
    }

    activateText() {
        this.props.activateText();
        this.props.closeActivateControlModal();
    }

    activatePrompt() {
        this.props.activatePrompt();
        this.props.closeActivateControlModal();
    }

    saveDraft() {
        this.props.save();
        this.props.closeActivateControlModal();
    }

    showInviteModal() {
        this.props.showInviteModal();
        this.props.closeActivateControlModal();
    }

    reject() {
        this.props.finishedSigningDocument({ reject: true });
        this.props.closeActivateControlModal();
    }

    render() {
        return (
            <Modal backdrop="static" show={true} onHide={this.props.closeActivateControlModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Select Signing Control</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="row">
                        <div className="col-sm-6 button-column">
                        <Button block bsSize="lg" onClick={this.activateSignature}><i className="fa fa-pencil-square-o"/> Signature</Button>
                        <Button block bsSize="lg" onClick={this.activateDate}><i className="fa fa-calendar"/> Date</Button>
                        { this.props.showPrompts && <Button block bsSize="lg" onClick={this.activatePrompt}><i className="fa fa-paste" /> Request Signature</Button>}
                        { this.props.showSave && <Button block bsSize="lg" onClick={this.saveDraft}><i className="fa fa-save" /> Save Draft</Button>}
                        </div>
                        <div className="col-sm-6 button-column">
                        <Button block bsSize="lg" onClick={this.activateInitial}><i className="fa fa-pencil-square"/> Initial</Button>
                        <Button block bsSize="lg" onClick={this.activateText}><i className="fa fa-font" /> Text</Button>
                        { this.props.showInvite && <Button block bsSize="lg" onClick={this.showInviteModal}><i className="fa fa-users" /> Invite</Button>}
                        { this.props.showReject && <Button block bsSize="lg" onClick={this.reject}><i className="fa fa-times" / >Reject</Button> }
                        </div>
                        </div>
                </Modal.Body>
            </Modal>
        );
    }
}

export default connectControls(UnconnectedActivateControlModal);