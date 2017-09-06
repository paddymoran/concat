import * as React from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Form, ControlLabel, FormGroup, FormControl } from 'react-bootstrap';
import { closeModal, rejectDocument, submitDocumentSet } from '../../actions';
import { findSetForDocument, signDocumentRoute, getNextDocument } from '../../utils';
import { reduxForm, Field, InjectedFormProps, formValueSelector, WrappedFieldProps } from 'redux-form';
import { DocumentsList, DocumentWithComplete } from './signConfirmation';
import { push } from 'react-router-redux';
import { prepareSubmitPayload } from './submitConfirmation';

interface RejectConfirmationProps {
    documentSetId: string;
    documentId: string;
    nextDocumentId: string;
    rejectReason: string;
    closeModal: () => void;
    rejectDocument: (payload: Sign.Actions.RejectDocumentPayload) => void;
    documents: DocumentWithComplete[];
    push: (url: string) => void;
    submitDocumentSet: (payload: Sign.Actions.SubmitDocumentSetPayload) => void;
    submitPayload: Sign.Actions.SubmitDocumentSetPayload;
}

class RejectConfirmation extends React.PureComponent<RejectConfirmationProps> {
    constructor(props: RejectConfirmationProps) {
        super(props);

        this.reject = this.reject.bind(this);
        this.submit = this.submit.bind(this);
        this.goToDocument = this.goToDocument.bind(this);
    }

    reject() {
        this.goToDocument(this.props.nextDocumentId);
    }

    submit() {
        this.props.rejectDocument({
            documentId: this.props.documentId,
            reason: this.props.rejectReason
        });
        this.props.submitDocumentSet(this.props.submitPayload);
        this.props.closeModal();
    }

    goToDocument(documentId: string) {
        this.props.rejectDocument({
            documentId: this.props.documentId,
            reason: this.props.rejectReason
        });
        this.props.push(signDocumentRoute(this.props.documentSetId, documentId, false));
        this.props.closeModal();
    }

    render() {
        return (
            <Modal backdrop='static' show={true} onHide={this.props.closeModal} className="icon-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Reject Document</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {
                        !!this.props.nextDocumentId &&
                        <div>
                            <i className="fa fa-exclamation modal-icon" aria-hidden="true"></i>

                            <p className='text-center'>Are you sure you want to <strong>reject</strong> signing this document and go to the next document? The inviter will be notified.</p>

                            <RejectReduxForm />
                            
                            <DocumentsList documents={this.props.documents} currentDocumentId={this.props.documentId} goToDocument={this.goToDocument} />

                            <Button bsStyle="primary" bsSize="lg" onClick={this.reject}>Next Document</Button>
                        </div>
                    }

                    {
                        !this.props.nextDocumentId &&
                        <div>
                            <i className="fa fa-pencil modal-icon" aria-hidden="true"></i>

                            <p className='text-center'>Are you sure you want to <strong>reject</strong> signing this document and submit all documents? The inviter will be notified.</p>

                            <RejectReduxForm />

                            <DocumentsList documents={this.props.documents} currentDocumentId={this.props.documentId} goToDocument={this.goToDocument} />

                            <Button bsStyle='primary' bsSize="lg" onClick={this.submit}>Reject &amp; Submit</Button>
                        </div>
                    }
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

        const documentSetId = findSetForDocument(state.documentSets, state.modals.documentId);

        const documentIds = state.documentSets[documentSetId].documentIds;
        const nextDocumentId = getNextDocument(documentIds, state.documentViewer.documents, state.modals.documentId);

        const documents = documentIds.map(documentId => ({
            id: documentId,
            ...state.documents[documentId],
            signStatus: (state.documentViewer.documents[documentId] || { signStatus: Sign.SignStatus.PENDING }).signStatus
        }));

        return {
            rejectReason,
            documents,
            nextDocumentId,
            documentId: state.modals.documentId,
            documentSetId,
            submitPayload: prepareSubmitPayload(documentSetId, state.documentSets[documentSetId], state.documentViewer)
        }
    },
    {
        push,
        rejectDocument,
        submitDocumentSet,
        closeModal: () => closeModal({ modalName: Sign.ModalType.REJECT_CONFIRMATION })
    }
)(RejectConfirmation);