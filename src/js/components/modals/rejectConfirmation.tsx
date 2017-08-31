import * as React from 'react';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { closeModal } from '../../actions';

interface RejectConfirmationProps {
    closeModal: () => void;
}

class RejectConfirmation extends React.PureComponent<RejectConfirmationProps> {
    render() {
        return (
            <Modal show={true} onHide={this.props.closeModal} className="icon-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Reject Document</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <i className="fa fa-exclamation modal-icon" aria-hidden="true"></i>

                    <p className='text-center'>Are you sure you want to <strong>reject</strong> this document?</p>

                    <Button bsStyle='primary' bsSize="lg">Reject</Button>
                </Modal.Body>
            </Modal>
        );
    }
}

export default connect(
    null,
    { closeModal: () => closeModal({ modalName: Sign.ModalType.REJECT_CONFIRMATION }) }
)(RejectConfirmation);