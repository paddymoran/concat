import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { closeModal } from '../../actions';

interface FailureProps {
    message: string
    hideModal: () => void;
}

class FailureModal  extends React.PureComponent<FailureProps> {
    render() {
        return (
            <Modal backdrop='static' show={true} onHide={this.props.hideModal} className="icon-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Action Failure</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <p>{ this.props.message }</p>
                 <Button onClick={this.props.hideModal}>Close</Button>
                </Modal.Body>
            </Modal>
        );
    }
}

export default connect(
    (state: Sign.State) => ({
        message: state.modals.message
    }),
    { hideModal: () => closeModal({modalName: Sign.ModalType.FAILURE})  },
)(FailureModal);