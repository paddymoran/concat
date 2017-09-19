import * as React from 'react';
import { connect } from 'react-redux';
import { closeModal, finishSigning } from '../../actions';
import { Modal, Button } from 'react-bootstrap';
import { DocumentsList, isSigning } from './signConfirmation';
import { SignStatus } from '../requestedSignatures';

interface ConnectedSigningCompleteProps {
    documentSetId: string;
    recipients: Sign.Recipients;
    userIsSigning: boolean;
    userIsRejecting: boolean;
    documents: Sign.Document[];
    closeModal: () => void;
    finishSigning: (payload: Sign.Actions.FinishSigningPayload) => void;
}

const strings = {
    sign: {
        singleDocument: 'This document has been signed.',
        multipleDocuments: 'The documents have been signed.',
    },
    signAndSend: {
        singleDocument: 'This document has been signed on your behalf and sent to the recipients to be signed.',
        multipleDocuments: 'The documents have been signed on your behalf and sent to the recipients to be signed.',
    },
    send: {
        singleDocument: 'This document has been sent to the recipients to be signed.',
        multipleDocuments: 'The documents have been sent to the recipients to be signed.',
    },
    reject: {
        singleDocument: 'This document has been rejected.',
        multipleDocuments: 'The documents have all been rejected.',
    },
    signAndReject: {
        singleDocument: '', // this is impossible - a single document can't be signed and rejected
        multipleDocuments: 'This document set is complete. You have signed some and rejected some.',
    }
};

class ConnectedSigningComplete extends React.PureComponent<ConnectedSigningCompleteProps> {
    render() {
        let content: any = null;

        if (this.props.userIsRejecting) {
            content = this.props.userIsSigning ? strings.signAndReject : strings.reject;
        }
        else if (this.props.userIsSigning) {
            content = this.props.recipients ? strings.signAndSend : strings.sign;
        }
        else {
            content = strings.send;
        }

        return (
            <Modal backdrop="static" show={true} onHide={this.props.closeModal} className="icon-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Signing Complete</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <i className="fa fa-pencil modal-icon" aria-hidden="true"></i>

                    <p className='text-center'>{this.props.documents.length === 1 ? content.singleDocument : content.multipleDocuments}</p>

                    <h3>Documents</h3>

                    {this.props.documents.map(document => <p key={document.id}>{document.filename}: <SignStatus signStatus={document.signStatus}/></p>)}

                    {this.props.recipients &&
                        <div>
                            <h3>Recipients</h3>

                            {this.props.recipients.map((recipient, index) =>
                                <p key={index}>
                                    <strong>{recipient.name}:</strong> {recipient.email}
                                </p>
                            )}
                        </div>
                    }

                    <Button bsStyle='primary' bsSize="lg" onClick={() => this.props.finishSigning({ documentSetId: this.props.documentSetId })}>View Documents</Button>
                </Modal.Body>
            </Modal>
        );
    }
}

export default connect<{}, {}, {}>(
    (state: Sign.State) => {
        const { documentSetId } = state.modals;

        const documentSet = state.documentSets[documentSetId];
        const recipients = documentSet ? documentSet.recipients : null;

        const userIsSigning = isSigning(state.documentViewer, documentSet.documentIds)
        let userIsRejecting = false;

        const documents = documentSet.documentIds.map(documentId => {
            const document = state.documents[documentId];
            const signStatus =  (state.documentViewer.documents[documentId] || { signStatus: Sign.SignStatus.PENDING }).signStatus

            if (signStatus === Sign.SignStatus.REJECTED) {
                userIsRejecting = true;
            }

            return {
                id: documentId,
                ...state.documents[documentId],
                signStatus,
            }
        });

        return { recipients, documentSetId, documents, userIsSigning, userIsRejecting };
    },
    {
        finishSigning,
        closeModal: () => closeModal({ modalName: Sign.ModalType.SIGNING_COMPLETE })
    }
)(ConnectedSigningComplete);