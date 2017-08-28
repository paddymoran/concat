import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { closeModal } from '../../actions';

interface InviteProps {
    hideModal: () => void;
}

class InviteModal extends React.PureComponent<InviteProps> {
    render() {
        return (
            <Modal show={true} onHide={this.props.hideModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Invite</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    HI!
                </Modal.Body>
            </Modal>
        );
    }
}

export default connect(
    (state: Sign.State) => ({}),
    { hideModal: () => closeModal({modalName: Sign.ModalType.INVITE}) },
)(InviteModal);