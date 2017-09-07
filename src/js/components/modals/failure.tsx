import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { closeModal } from '../../actions';

interface FailureProps {
    message: string;
    title: string;
    closeModal: () => void;
}

class FailureModal  extends React.PureComponent<FailureProps> {
    render() {
        return (
            <Modal backdrop='static' show={true} onHide={this.props.closeModal} className="icon-modal">
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.title || 'Action Failure'}</Modal.Title>
                </Modal.Header>
                
                <Modal.Body>
                    <p>{this.props.message}</p>
                    <Button onClick={this.props.closeModal}>Close</Button>
                </Modal.Body>
            </Modal>
        );
    }
}

export default connect(
    (state: Sign.State) => ({
        message: state.modals.message,
        title: state.modals.title
    }),
    { closeModal: () => closeModal({modalName: Sign.ModalType.FAILURE})  },
)(FailureModal);