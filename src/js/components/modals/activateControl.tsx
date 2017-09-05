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
        this.props.saveDraft();
        this.props.closeActivateControlModal();
    }

    render() {
        return (
            <Modal backdrop="static" show={true} onHide={this.props.closeActivateControlModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Select Signing Control</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Button block bsSize="lg" onClick={this.activateSignature}>Signature</Button>
                    <Button block bsSize="lg" onClick={this.activateInitial}>Initial</Button>
                    <Button block bsSize="lg" onClick={this.activateDate}>Date</Button>
                    <Button block bsSize="lg" onClick={this.activateText}>Text</Button>
                    <Button block bsSize="lg" onClick={this.activatePrompt}>Request Signature</Button>
                    <Button block bsSize="lg" onClick={this.activateDate}>Save Draft</Button>
                    <Button block bsSize="lg" onClick={this.activateDate}>Invite</Button>
                </Modal.Body>
            </Modal>
        );
    }
}

// export default connect(
//     (state: Sign.State) => ({

//     }),
//     {
//         closeModal: () => closeModal({ modalName: Sign.ModalType.ACTIVATE_CONTROL }),
//         setActiveSignControl,
//         saveDraft: saveDocumentView
//     }
// )(UnconnectedActivateControlModal);

export default connectControls(UnconnectedActivateControlModal);