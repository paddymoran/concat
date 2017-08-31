import * as React from 'react';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { closeModal, rejectDocument } from '../../actions';
import { findSetForDocument } from '../../utils';

interface RejectConfirmationProps {
    documentSetId: string;
    documentId: string;
    closeModal: () => void;
    rejectDocument: (payload: Sign.Actions.RejectDocumentPayload) => void;
}

class RejectConfirmation extends React.PureComponent<RejectConfirmationProps> {
    constructor(props: RejectConfirmationProps) {
        super(props);

        this.reject = this.reject.bind(this);
    }

    reject() {
        this.props.rejectDocument({
            documentSetId: this.props.documentSetId,
            documentId: this.props.documentId
        });
        this.props.closeModal();
    }

    render() {
        return (
            <Modal show={true} onHide={this.props.closeModal} className="icon-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Reject Document</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <i className="fa fa-exclamation modal-icon" aria-hidden="true"></i>

                    <p className='text-center'>Are you sure you want to <strong>reject</strong> signing this document?  The inviter will be notified.</p>

                    <Button bsStyle="primary" bsSize="lg" onClick={this.reject}>Reject</Button>
                </Modal.Body>
            </Modal>
        );
    }
}

export default connect(
    (state: Sign.State) => ({
        documentId: state.modals.documentId,
        documentSetId: findSetForDocument(state.documentSets, state.modals.documentId)
    }),
    {
        rejectDocument,
        closeModal: () => closeModal({ modalName: Sign.ModalType.REJECT_CONFIRMATION })
    }
)(RejectConfirmation);