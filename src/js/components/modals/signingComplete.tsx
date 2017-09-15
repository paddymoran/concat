import * as React from 'react';
import { connect } from 'react-redux';
import { closeModal } from '../../actions';
import { Modal, Button } from 'react-bootstrap';
import { DocumentsList } from './signConfirmation';
import { SignStatus } from '../requestedSignatures';

interface ConnectedSigningCompleteProps {
    documents: Sign.Document[];
    closeModal: () => void;
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

                    <p className='text-center'>Are you sure you want to move to the next document?</p>

                    
                    <h3>Documents</h3>

                    {this.props.documents.map(document => <p key={document.id}>{document.filename}: <SignStatus signStatus={document.signStatus}/></p>)}

                    <Button bsStyle='primary' bsSize="lg" onClick={() => {}}>Done</Button>
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

        return { documents };
    },
    { closeModal }
)(ConnectedSigningComplete);