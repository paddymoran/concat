import * as React from 'react';
import { connect } from 'react-redux';
import { closeModal, finishSigning } from '../../actions';
import { Modal, Button } from 'react-bootstrap';
import { DocumentsList } from './signConfirmation';
import { SignStatus } from '../requestedSignatures';

interface ConnectedSigningCompleteProps {
    documentSetId: string;
    documents: Sign.Document[];
    closeModal: () => void;
    finishSigning: (payload: Sign.Actions.FinishSigningPayload) => void;
}

class ConnectedSigningComplete extends React.PureComponent<ConnectedSigningCompleteProps> {
    render() {
        return (
            <Modal backdrop="static" show={true} onHide={this.props.closeModal} className="icon-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Signing Complete</Modal.Title>
                </Modal.Header>
                
                <Modal.Body>
                    <i className="fa fa-pencil modal-icon" aria-hidden="true"></i>

                    <p className='text-center'>All documents have been signed. You can download them on the next page.</p>
                    
                    <h3>Documents</h3>

                    {this.props.documents.map(document => <p key={document.id}>{document.filename}: <SignStatus signStatus={document.signStatus}/></p>)}

                    <Button bsStyle='primary' bsSize="lg" onClick={() => this.props.finishSigning({ documentSetId: this.props.documentSetId })}>Next Page</Button>
                </Modal.Body>
            </Modal>
        );
    }
}

export default connect<{}, {}, {}>(
    (state: Sign.State) => {
        const { documentSetId } = state.modals;
        const documentIds = state.documentSets[state.modals.documentSetId].documentIds;

        const documents = documentIds.map(documentId => ({
            id: documentId,
            ...state.documents[documentId],
            signStatus: (state.documentViewer.documents[documentId] || { signStatus: Sign.SignStatus.PENDING }).signStatus
        }));

        return { documentSetId, documents };
    },
    {
        finishSigning,
        closeModal: () => closeModal({ modalName: Sign.ModalType.SIGNING_COMPLETE })
    }
)(ConnectedSigningComplete);