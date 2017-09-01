import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { closeModal, nextDocument } from '../../actions';
import { connect } from 'react-redux';
import { findSetForDocument } from '../../utils';

interface NextDocumentProps {
    documentSetId: string;
    documentId: string;
    closeModal: () => void;
    nextDocument: (payload: Sign.Actions.NextDocumentPayload) => void;
}

class NextDocument extends React.PureComponent<NextDocumentProps> {
    constructor(props: NextDocumentProps) {
        super(props);

        this.next = this.next.bind(this);
    }

    next() {
        this.props.nextDocument({
            documentSetId: this.props.documentSetId,
            documentId: this.props.documentId
        });
    }

    render() {
        return (
            <Modal backdrop='static' show={true} onHide={this.props.closeModal} className="icon-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Next Document</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <i className="fa fa-exclamation modal-icon" aria-hidden="true"></i>

                    <p className='text-center'>Are you finished with this document and ready to go to the next document?</p>

                    <Button bsStyle="primary" bsSize="lg" onClick={this.next}>Next Document</Button>
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
        nextDocument,
        closeModal: () => closeModal({ modalName: Sign.ModalType.NEXT_DOCUMENT })
    }
)(NextDocument);