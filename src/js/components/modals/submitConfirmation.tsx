import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { submitSignRequests, closeModal } from '../../actions';

interface SignConfirmationProps {
    signRequestStatus: Sign.DownloadStatus;
    documentSetId: string;
    hideModal: () => void;
    submitPayload: Sign.Actions.SubmitSignRequestsPayload,
    submitSignRequests: (payload: Sign.Actions.SubmitSignRequestsPayload) => void;
}


function prepareSubmitPayload(documentSetId : string, documentSet : Sign.DocumentSet) : Sign.Actions.SubmitSignRequestsPayload {
    return {
        documentSetId,
        signatureRequests: (documentSet.recipients || []).map((recipient) => {
            return {
                recipient,
                documentIds: documentSet.documentIds
            }
        })
    }
}

class SubmitConfirmation extends React.PureComponent<SignConfirmationProps> {
    constructor(props: SignConfirmationProps) {
        super(props);
        this.submit = this.submit.bind(this);
    }

    submit() {
        return this.props.submitSignRequests(this.props.submitPayload);
    }

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

                <p className='text-center'>Are you sure you send this document set to be signed?</p>

                <Button bsStyle='primary' bsSize="lg" onClick={this.submit}>Send</Button>
            </div>
        );
    }

    render() {
        return (
            <Modal show={true} onHide={this.props.hideModal} className="icon-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Submission Confirmation</Modal.Title>
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
        submitPayload: prepareSubmitPayload(state.modals.documentSetId, state.documentSets[state.modals.documentSetId])
    }),
    { submitSignRequests, hideModal: () => closeModal({modalName: Sign.ModalType.SUBMIT_CONFIRMATION})  },
)(SubmitConfirmation);