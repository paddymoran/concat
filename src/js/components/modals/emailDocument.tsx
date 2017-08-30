import * as React from 'react';
import { connect } from 'react-redux';
import { Modal, ButtonToolbar, Button } from 'react-bootstrap';
import { closeModal, emailDocument } from '../../actions';
import { InviteForm } from '../selectRecipients';
import { submit } from 'redux-form';

interface EmailDocumentProps {
    documentId: string;
    closeModal: () => void;
    submit: () => void;
    emailDocument: (payload: Sign.Actions.EmailDocumentPayload) => void;
}

class EmailDocument extends React.PureComponent<EmailDocumentProps> {
    constructor(props: EmailDocumentProps) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(values: { recipients: Sign.Recipients }) {
        this.props.emailDocument({
            documentId: this.props.documentId,
            recipients: values.recipients
        });
        this.props.closeModal();
    }

    render() {
        return(
            <Modal show={true} onHide={this.props.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Email Document</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <InviteForm initialValues={{ recipients: [{}] }} onSubmit={this.onSubmit} />
                </Modal.Body>

                <Modal.Footer>
                    <ButtonToolbar className="pull-right">
                        <Button onClick={this.props.closeModal}>Close</Button>
                        <Button bsStyle="primary" onClick={this.props.submit}>Send</Button>
                    </ButtonToolbar>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default connect(
    (state: Sign.State) => ({
        documentId: state.modals.documentId,
    }),
    {
        emailDocument,
        submit: () => submit(Sign.FormName.RECIPIENTS),
        closeModal: () => closeModal({ modalName: Sign.ModalType.EMAIL_DOCUMENT })
    }
)(EmailDocument)