import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { submitSignRequests, closeModal } from '../../actions';

interface SignConfirmationProps {
    signRequestStatus: Sign.DownloadStatus;
    documentSetId: string;
    hideModal: () => void;
    recipients: Sign.Recipients;
    submitPayload: Sign.Actions.SubmitSignRequestsPayload,
    submitSignRequests: (payload: Sign.Actions.SubmitSignRequestsPayload) => void;
}


function prepareSubmitPayload(documentSetId : string, documentSet : Sign.DocumentSet, documentViewer: Sign.DocumentViewer) : Sign.Actions.SubmitSignRequestsPayload {
    const prompts = Object.keys(documentViewer.prompts).reduce((acc:any, key:string) => {
        const prompt : Sign.DocumentPrompt = documentViewer.prompts[key];
        if(documentSet.documentIds.indexOf(prompt.documentId) >= 0){
            acc[prompt.value.recipientEmail] = [...(acc[prompt.value.recipientEmail] || []), prompt];
        }
        return acc;
    }, {});
    const recipients = (documentSet.recipients || []).reduce((acc: any, r) => {
        acc[r.email] = r;
        return acc;
    }, {});

    if(Object.keys(prompts).length){
        return {
            documentSetId,
            signatureRequests: Object.keys(prompts).map((key:string) => {
                return {
                    recipient: recipients[key],
                    prompts: prompts[key]
                }
            })
        }
    }

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

                <p className='text-center'>Are you sure this document is ready to be sent and signed?</p>

                <h3>Recipients</h3>

                {this.props.recipients.map((recipient, index) =>
                    <p key={index}>
                        <strong>{recipient.name}:</strong> {recipient.email}
                    </p>
                )}

                <Button bsStyle='primary' bsSize="lg" onClick={this.submit}>Send</Button>
            </div>
        );
    }

    render() {
        return (
            <Modal backdrop='static' show={true} onHide={this.props.hideModal} className="icon-modal">
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
        submitPayload: prepareSubmitPayload(state.modals.documentSetId, state.documentSets[state.modals.documentSetId], state.documentViewer),
        recipients: state.documentSets[state.modals.documentSetId].recipients,
    }),
    { submitSignRequests, hideModal: () => closeModal({modalName: Sign.ModalType.SUBMIT_CONFIRMATION})  },
)(SubmitConfirmation);