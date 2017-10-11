import * as React from 'react';
import { Button,  ButtonToolbar } from 'react-bootstrap';
import Modal from './modal';
import { connect } from 'react-redux';
import { closeModal, defineRecipients } from '../../actions';
import { InviteForm } from '../selectRecipients';
import { submit } from 'redux-form';

interface InviteProps {
    hideModal: () => void;
    recipients: Sign.Recipients;
    documentSetId: string;
    defineRecipients: (payload: Sign.Actions.DefineRecipientsPayload) => void;
    submit: () => void;
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
                    <InviteForm initialValues={{recipients: this.props.recipients}} onSubmit={this.onSubmit} />
                </Modal.Body>

                <Modal.Footer>
                    <ButtonToolbar className="pull-right">
                        <Button onClick={this.props.hideModal}>Cancel</Button>
                        <Button onClick={this.props.submit} bsStyle="primary">Save</Button>
                    </ButtonToolbar>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default connect(
    (state: Sign.State) => {
        const documentSets: any = state.documentSets[state.modals.documentSetId] || { recipients: null };
        const recipients = documentSets.recipients || [{}];

        return { recipients, documentSetId: state.modals.documentSetId };
    },
    {
        submit: () => submit(Sign.FormName.RECIPIENTS),
        defineRecipients,
        hideModal: () => closeModal({modalName: Sign.ModalType.INVITE})
    }
)(InviteModal);