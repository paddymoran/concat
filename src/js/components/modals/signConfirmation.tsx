import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { closeModal, markDocumentAsComplete, submitDocumentSet } from '../../actions';
import { push } from 'react-router-redux';
import { signDocumentRoute, getNextDocument } from '../../utils';
import { prepareSubmitPayload } from './submitConfirmation';

export interface DocumentWithComplete extends Sign.Document {
    complete: boolean;
}

interface SignConfirmationProps {
    signRequestStatus: Sign.DownloadStatus;
    documentId: string;
    documentSetId: string;
    signRequestId: number;
    recipients: Sign.Recipients;
    closeModal: () => void;
    submitDocumentSet: (payload: Sign.Actions.SubmitDocumentSetPayload) => void;
    nextDocumentId: string;
    push: (url: string) => void;
    isDocumentOwner: boolean;
    markDocumentAsComplete: (payload: Sign.Actions.MarkDocumentAsCompletePayload) => void;
    documents: DocumentWithComplete[];
    submitPayload: Sign.Actions.SubmitDocumentSetPayload;
}

interface RecipientsListProps {
    recipients: Sign.Recipients;
}

export class RecipientsList extends React.PureComponent<RecipientsListProps> {
    render() {
        return (
            <div>
                <h3>Recipients</h3>

                {this.props.recipients.map((recipient, index) =>
                    <p key={index}>
                        <strong>{recipient.name}:</strong> {recipient.email}
                    </p>
                )}
            </div>
        );
    }
}

interface DocumentsListProps {
    currentDocumentId: string;
    documents: DocumentWithComplete[];
    goToDocument: (documentId: string) => void;
}

export class DocumentsList extends React.PureComponent<DocumentsListProps> {
    render() {
        return (
            <div>
                <h3>Other Documents</h3>

                {this.props.documents.length <= 1 && <em>None</em>}
                {this.props.documents.map(document => {
                    if (document.id === this.props.currentDocumentId) {
                        return false;
                    }

                    return (
                        <p key={document.id}>
                            <a onClick={() => this.props.goToDocument(document.id)}>{document.filename}</a>: {document.complete ? 'complete' : 'pending'}
                        </p>
                    );
                })}
            </div>
        );
    }
}

class SignConfirmation extends React.PureComponent<SignConfirmationProps> {
    constructor(props: SignConfirmationProps) {
        super(props);
        this.sign = this.sign.bind(this);
        this.next = this.next.bind(this);
        this.goToDocument = this.goToDocument.bind(this);
    }

    sign() {
        this.props.submitDocumentSet(this.props.submitPayload);
        this.props.closeModal();
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

                {this.props.recipients && this.props.recipients.length && <RecipientsList recipients={this.props.recipients} />}

                <DocumentsList documents={this.props.documents} currentDocumentId={this.props.documentId} goToDocument={this.goToDocument} />

                <Button bsStyle='primary' bsSize="lg" onClick={this.sign}>Sign Documents</Button>
            </div>
        );
    }

    renderNextBody() {
        return (
            <div>
                <i className="fa fa-forward modal-icon" aria-hidden="true"></i>

                <p className='text-center'>Are you sure you want to move to the next document?</p>

                <DocumentsList documents={this.props.documents} currentDocumentId={this.props.documentId} goToDocument={this.goToDocument} />

                <Button bsStyle='primary' bsSize="lg" onClick={this.next}>Next Document</Button>
            </div>
        );
    }

    next() {
        this.goToDocument(this.props.nextDocumentId);
    }

    goToDocument(documentId: string) {
        this.props.markDocumentAsComplete({ documentId: this.props.documentId, complete: true });
        this.props.push(signDocumentRoute(this.props.documentSetId, documentId, this.props.isDocumentOwner));
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
                </Modal.Body>
            </Modal>
        );
    }
}

export default connect(
    (state: Sign.State) => {
        const documentSet = state.documentSets[state.modals.documentSetId];
        const recipients = documentSet ? documentSet.recipients : null;

        const documentIds = state.documentSets[state.modals.documentSetId].documentIds;
        const nextDocumentId = getNextDocument(documentIds, state.documentViewer.documents, state.modals.documentId);

        const documents = documentIds.map(documentId => ({
            id: documentId,
            ...state.documents[documentId],
            complete: (state.documentViewer.documents[documentId] || { completed: false }).completed
        }));

        return {
            signRequestStatus: state.documentViewer.signRequestStatus,
            documentId: state.modals.documentId,
            documentSetId: state.modals.documentSetId,
            signRequestId: state.modals.signRequestId,
            documents,
            recipients,
            nextDocumentId,
            isDocumentOwner: state.modals.isDocumentOwner,
            submitPayload: prepareSubmitPayload(state.modals.documentSetId, state.documentSets[state.modals.documentSetId], state.documentViewer)
        }
    },
    { submitDocumentSet, push, closeModal: () => closeModal({modalName: Sign.ModalType.SIGN_CONFIRMATION}), markDocumentAsComplete },
)(SignConfirmation);