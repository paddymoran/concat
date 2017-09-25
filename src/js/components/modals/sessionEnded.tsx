import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { closeModal } from '../../actions';

interface SessionEndedProps {
    closeModal: () => void;
}

class SessionEndedModal  extends React.PureComponent<SessionEndedProps> {
    render() {
        return (
            <Modal backdrop='static' show={true} onHide={this.props.closeModal} className="icon-modal">
                <Modal.Header closeButton>
                    <Modal.Title>{ }</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                <p>Sorry, your current session has expired. Please click the button below to sign back in.</p>
                <a className="btn btn-primary" href="/">Sign Back In</a>
                </Modal.Body>
            </Modal>
        );
    }
}

export default connect(
    (state: Sign.State) => ({
    }),
    { closeModal: () => closeModal({modalName: Sign.ModalType.SESSION_ENDED})  },
)(SessionEndedModal);