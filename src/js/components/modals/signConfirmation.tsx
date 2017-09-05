import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { signDocument, closeModal, markDocumentAsComplete } from '../../actions';
import { push } from 'react-router-redux';
import { signDocumentRoute } from '../../utils';

interface SignConfirmationProps {
    signRequestStatus: Sign.DownloadStatus;
    documentId: string;
    documentSetId: string;
    signRequestId: number;
    recipients: Sign.Recipients;
    closeModal: () => void;
    signDocument: (payload: Sign.Actions.SignDocumentPayload) => void;
    nextDocumentId: string;
    push: (url: string) => void;
    isDocumentOwner: boolean;
    markDocumentAsComplete: (payload: Sign.Actions.MarkDocumentAsCompletePayload) => void;
}

class SignConfirmation extends React.PureComponent<SignConfirmationProps> {
    constructor(props: SignConfirmationProps) {
        super(props);
        this.sign = this.sign.bind(this);
        this.next = this.next.bind(this);
    }

    sign() {
        this.props.signDocument({ documentId: this.props.documentId, documentSetId: this.props.documentSetId, signRequestId: this.props.signRequestId });
    }

    renderLoading() {
        return (
            <div>
                <div className='loading' />
                <p>Signing document, please wait.</p>
            </div>
        );
    }

    renderSignBody() {
        return (
            <div>
                <i className="fa fa-pencil modal-icon" aria-hidden="true"></i>

                <p className='text-center'>Are you sure you want to sign all documents?</p>

                <Button bsStyle='primary' bsSize="lg" onClick={this.sign}>Sign Documents</Button>
            </div>
        );
    }

    renderNextBody() {
        return (
            <div>
                <i className="fa fa-forward modal-icon" aria-hidden="true"></i>

                <p className='text-center'>Are you sure you want to move to the next document?</p>

                <Button bsStyle='primary' bsSize="lg" onClick={this.next}>Next Document</Button>
            </div>
        );
    }

    next() {
        this.props.markDocumentAsComplete({ documentId: this.props.documentId, complete: true });
        this.props.push(signDocumentRoute(this.props.documentSetId, this.props.nextDocumentId, this.props.isDocumentOwner));
        this.props.closeModal();
    }

    render() {
        let body: JSX.Element = null;

        if (this.props.signRequestStatus === Sign.DownloadStatus.InProgress) {
            body = this.renderLoading();
        }
        else if (this.props.nextDocumentId) {
            body = this.renderNextBody();
        }
        else {
            body = this.renderSignBody();
        }

        return (
            <Modal backdrop='static' show={true} onHide={this.props.closeModal} className="icon-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Sign Confirmation</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {body}

                    {this.props.recipients && this.props.recipients.length &&
                        <div>
                            <h3>Recipients</h3>

                            {this.props.recipients.map((recipient, index) =>
                                <p key={index}>
                                    <strong>{recipient.name}:</strong> {recipient.email}
                                </p>
                            )}
                        </div>
                    }
                </Modal.Body>
            </Modal>
        );
    }
}

function getNextDocument(documentIds: string[], documents: Sign.DocumentViews, currentDocumentId: string): string {
    return documentIds.filter(d => d != currentDocumentId).find(documentId => !documents[documentId] || !documents[documentId].completed);
}

export default connect(
    (state: Sign.State) => {
        const documentSet = state.documentSets[state.modals.documentSetId];
        const recipients = documentSet ? documentSet.recipients : null;

        const nextDocumentId = getNextDocument(state.documentSets[state.modals.documentSetId].documentIds, state.documentViewer.documents, state.modals.documentId);

        return {
            signRequestStatus: state.documentViewer.signRequestStatus,
            documentId: state.modals.documentId,
            documentSetId: state.modals.documentSetId,
            signRequestId: state.modals.signRequestId,
            recipients,
            nextDocumentId,
            isDocumentOwner: state.modals.isDocumentOwner
        }
    },
    { signDocument, push, closeModal: () => closeModal({modalName: Sign.ModalType.SIGN_CONFIRMATION}), markDocumentAsComplete },
)(SignConfirmation);