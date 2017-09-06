import * as React from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Form, ControlLabel, FormGroup, FormControl } from 'react-bootstrap';
import { closeModal, rejectDocument } from '../../actions';
import { findSetForDocument } from '../../utils';
import { reduxForm, Field, InjectedFormProps, formValueSelector, WrappedFieldProps } from 'redux-form';

interface RejectConfirmationProps {
    documentSetId: string;
    documentId: string;
    rejectReason: string;
    closeModal: () => void;
    rejectDocument: (payload: Sign.Actions.RejectDocumentPayload) => void;
}

class RejectConfirmation extends React.PureComponent<RejectConfirmationProps> {
    constructor(props: RejectConfirmationProps) {
        super(props);

        this.reject = this.reject.bind(this);
    }

    reject() {
        this.props.rejectDocument({
            documentSetId: this.props.documentSetId,
            documentId: this.props.documentId,
            reason: this.props.rejectReason
        });
        this.props.closeModal();
    }

    render() {
        return (
            <Modal backdrop='static' show={true} onHide={this.props.closeModal} className="icon-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Reject Document</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <i className="fa fa-exclamation modal-icon" aria-hidden="true"></i>

                    <p className='text-center'>Are you sure you want to <strong>reject</strong> signing this document?  The inviter will be notified.</p>

                    <RejectReduxForm />

                    <Button bsStyle="primary" bsSize="lg" onClick={this.reject}>Reject</Button>
                </Modal.Body>
            </Modal>
        );
    }
}

class TextareaReduxField extends React.PureComponent<WrappedFieldProps> {
    render() {
        return <FormControl {...this.props.input} componentClass="textarea" placeholder="Reason for rejecting..." />
    }
}

class RejectForm extends React.PureComponent<InjectedFormProps> {
    render() {
        return (
            <Form className="text-left">
                <FormGroup>
                    <ControlLabel>Reason for rejecting (optional)</ControlLabel>
                    <Field name="rejectReason" component={TextareaReduxField as any} />
                </FormGroup>
            </Form>
        );
    }
}

export const RejectReduxForm = reduxForm<{ reason: string; }>(
    { form: Sign.FormName.REJECT }
)(RejectForm);

export default connect(
    (state: Sign.State) => {
        const selector = formValueSelector(Sign.FormName.REJECT);
        const rejectReason = selector(state, 'rejectReason');
        return {
            rejectReason,
            documentId: state.modals.documentId,
            documentSetId: findSetForDocument(state.documentSets, state.modals.documentId)
        }
    },
    {
        rejectDocument,
        closeModal: () => closeModal({ modalName: Sign.ModalType.REJECT_CONFIRMATION })
    }
)(RejectConfirmation);