import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { closeModal, defineRecipients } from '../../actions';
import { InviteForm } from '../selectRecipients';

interface InviteProps {
    hideModal: () => void;
    recipients: Sign.Recipients;
    documentSetId: string;
    defineRecipients: (payload: Sign.Actions.DefineRecipientsPayload) => void;
}

interface RecipientList {
    recipients: Sign.Recipients;
}

class InviteModal extends React.PureComponent<InviteProps> {
    constructor(props: InviteProps) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(values: RecipientList) {
        this.props.defineRecipients({
            documentSetId: this.props.documentSetId,
            recipients: values.recipients
        });
        this.props.hideModal();
    }

    render() {
        return (
            <Modal backdrop='static' show={true} onHide={this.props.hideModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Invite</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <InviteForm initialValues={{recipients: this.props.recipients}} onSubmit={this.onSubmit} fullWidth={true} />
                </Modal.Body>
            </Modal>
        );
    }
}

export default connect(
    (state: Sign.State) => {
        const documentSets: any = state.documentSets[state.modals.documentSetId] || { recipients: [{}] };
        return { recipients: documentSets.recipients, documentSetId: state.modals.documentSetId };
    },
    {
        defineRecipients,
        hideModal: () => closeModal({modalName: Sign.ModalType.INVITE})
    }
)(InviteModal);