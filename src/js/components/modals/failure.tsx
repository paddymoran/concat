import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { closeModal } from '../../actions';

interface FailureProps {
    message: string;
    title: string;
    type: string;
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
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.closeModal}>Close</Button>
                    { this.props.type === 'USAGE_LIMIT_REACHED' && <a className="btn btn-primary" href="/signup">Subscribe</a> }
                </Modal.Footer>
            </Modal>
        );
    }
}

export default connect(
    (state: Sign.State) => ({
        message: state.modals.message,
        title: state.modals.title,
        type: state.modals.type
    }),
    { closeModal: () => closeModal({modalName: Sign.ModalType.FAILURE})  },
)(FailureModal);