import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { signDocument } from '../../actions';

interface SignConfirmationProps {
    signRequestStatus: Sign.DownloadStatus;
    documentId: string;
    documentSetId: string;
    signatures: Sign.Signatures;
    hideModal: () => void;
    signDocument: (payload: Sign.Actions.SignDocumentPayload) => void;
}

class SignConfirmation extends React.PureComponent<SignConfirmationProps> {
    renderLoading() {
        return (
            <div>
                <div className='loading' />
                <p>Signing document, please wait.</p>
            </div>
        );
    }

    renderBody() {
        return (
            <div>
                <i className="fa fa-pencil modal-icon" aria-hidden="true"></i>
                
                <p className='text-center'>Are you sure you want to sign this document?</p>
                
                <Button bsStyle='primary' bsSize="lg" onClick={() => this.props.signDocument({ documentId: this.props.documentId, signatures: this.props.signatures, documentSetId: this.props.documentSetId })}>Sign</Button>
            </div>
        );
    }

    render() {
        return (
            <Modal show={true} onHide={this.props.hideModal} className="icon-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Sign Confirmation</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {this.props.signRequestStatus === Sign.DownloadStatus.InProgress ? this.renderLoading() : this.renderBody()}
                </Modal.Body>
            </Modal>
        );
    }
}

export default connect(
    (state: Sign.State) => ({
        signRequestStatus: state.documentViewer.signRequestStatus,
        documentId: state.modals.documentId,
        documentSetId: state.modals.documentSetId,
        signatures: state.documentViewer.signatures
    }),
    { signDocument },
)(SignConfirmation);