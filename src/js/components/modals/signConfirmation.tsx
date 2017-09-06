import * as React from 'react';
import { reduxForm, Field, InjectedFormProps, formValueSelector, WrappedFieldProps } from 'redux-form';
import { Modal, Button, Form, ControlLabel, FormGroup, FormControl } from 'react-bootstrap';
import { connect } from 'react-redux';
import { closeModal, markDocumentAsComplete, submitDocumentSet, rejectDocument } from '../../actions';
import { push } from 'react-router-redux';
import { signDocumentRoute, getNextDocument } from '../../utils';
import { SignStatus } from '../requestedSignatures';


export function prepareSubmitPayload(documentSetId : string, documentSet : Sign.DocumentSet, documentViewer: Sign.DocumentViewer) : Sign.Actions.SubmitDocumentSetPayload {
    const prompts = Object.keys(documentViewer.prompts).reduce((acc:any, key:string) => {
        const prompt : Sign.DocumentPrompt = documentViewer.prompts[key];
        if(documentSet.documentIds.indexOf(prompt.documentId) >= 0){
            acc[prompt.value.recipientEmail] = [...(acc[prompt.value.recipientEmail] || []), prompt];
        }
        return acc;
    }, {});
    const recipients = (documentSet.recipients || []).reduce((acc: any, r) => {
        acc[r.email] = r;
        return acc;
    }, {});

    if(Object.keys(prompts).length){
        return {
            documentSetId,
            signatureRequests: Object.keys(prompts).map((key:string) => {
                return {
                    recipient: recipients[key],
                    prompts: prompts[key]
                }
            })
        }
    }

    return {
        documentSetId,
        signatureRequests: (documentSet.recipients || []).map((recipient) => {
            return {
                recipient,
                documentIds: documentSet.documentIds
            }
        })
    }
}

export interface DocumentWithStatus extends Sign.Document {
    signStatus: Sign.SignStatus;
}

interface SignConfirmationProps {
    reject: boolean;
}

interface InjectedSignConfirmationProps {
    signRequestStatus: Sign.DownloadStatus;
    documentId: string;
    documentSetId: string;
    recipients: Sign.Recipients;
    closeModal: () => void;
    submitDocumentSet: (payload: Sign.Actions.SubmitDocumentSetPayload) => void;
    nextDocumentId: string;
    push: (url: string) => void;
    isDocumentOwner: boolean;
    markDocumentAsComplete: (payload: Sign.Actions.MarkDocumentAsCompletePayload) => void;
    documents: DocumentWithStatus[];
    submitPayload: Sign.Actions.SubmitDocumentSetPayload;
}

type UnconnectedSignConfirmationProps = SignConfirmationProps & InjectedSignConfirmationProps;

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
    documents: DocumentWithStatus[];
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
                            <a onClick={() => this.props.goToDocument(document.id)}>{document.filename}</a>: <SignStatus signStatus={document.signStatus}/>
                        </p>
                    );
                })}
            </div>
        );
    }
}

class LoadingModalBody extends React.PureComponent {
    render() {
        return (
            <div>
                <div className='loading' />
                <p>Signing document, please wait.</p>
            </div>
        );
    }
}

interface SignAndNextProps {
    documents: DocumentWithStatus[];
    currentDocumentId: string;
    nextDocumentId: string;
    markDocumentAsComplete: (payload: Sign.Actions.MarkDocumentAsCompletePayload) => void;
    goToDocument: (documentId: string) => void;
}

class SignAndNext extends React.PureComponent<SignAndNextProps> {
    constructor(props: SignAndNextProps) {
        super(props);
        this.next = this.next.bind(this);
    }

    next() {
        this.props.markDocumentAsComplete({ documentId: this.props.currentDocumentId, complete: true });
        this.props.goToDocument(this.props.nextDocumentId)
    }

    render() {
        return (
            <div>
                <i className="fa fa-forward modal-icon" aria-hidden="true"></i>

                <p className='text-center'>Are you sure you want to move to the next document?</p>

                <DocumentsList documents={this.props.documents} currentDocumentId={this.props.currentDocumentId} goToDocument={this.props.goToDocument} />

                <Button bsStyle='primary' bsSize="lg" onClick={this.next}>Next Document</Button>
            </div>
        );
    }
}

interface SignAndSubmitProps {
    currentDocumentId: string;
    documents: DocumentWithStatus[];
    recipients: Sign.Recipients;
    submitPayload: Sign.Actions.SubmitDocumentSetPayload;
    goToDocument: (documentId: string) => void;
    submitDocumentSet: (payload: Sign.Actions.SubmitDocumentSetPayload) => void;
    markDocumentAsComplete: (payload: Sign.Actions.MarkDocumentAsCompletePayload) => void;
}

class SignAndSubmit extends React.PureComponent<SignAndSubmitProps> {
    constructor(props: SignAndSubmitProps) {
        super(props);
        this.sign = this.sign.bind(this);
    }

    sign() {
        this.props.markDocumentAsComplete({ documentId: this.props.currentDocumentId, complete: true });
        this.props.submitDocumentSet(this.props.submitPayload);
    }

    render() {
        return (
            <div>
                <i className="fa fa-pencil modal-icon" aria-hidden="true"></i>

                <p className='text-center'>Are you sure you want to sign all documents?</p>

                {this.props.recipients && this.props.recipients.length && <RecipientsList recipients={this.props.recipients} />}

                <DocumentsList documents={this.props.documents} currentDocumentId={this.props.currentDocumentId} goToDocument={this.props.goToDocument} />

                <Button bsStyle='primary' bsSize="lg" onClick={this.sign}>Sign Documents</Button>
            </div>
        );
    }
}

interface RejectAndNextProps {
    currentDocumentId: string;
    nextDocumentId: string;
    documents: DocumentWithStatus[];
    goToDocument: (documentId: string) => void;
}

interface InjectedRejectAndNextProps {
    rejectReason: string;
    rejectDocument: (payload: Sign.Actions.RejectDocumentPayload) => void;
}

type UnconnectedRejectAndNextProps = RejectAndNextProps & InjectedRejectAndNextProps;

class UnconnectedRejectAndNext extends React.PureComponent<UnconnectedRejectAndNextProps> {
    constructor(props: UnconnectedRejectAndNextProps) {
        super(props);
        this.reject = this.reject.bind(this);
    }

    reject() {
        this.props.rejectDocument({
            documentId: this.props.currentDocumentId,
            reason: this.props.rejectReason
        });
        this.props.goToDocument(this.props.nextDocumentId);
    }

    render() {
        return (
            <div>
                <i className="fa fa-exclamation modal-icon" aria-hidden="true"></i>

                <p className='text-center'>Are you sure you want to <strong>reject</strong> signing this document and go to the next document? The inviter will be notified.</p>

                <RejectReduxForm />
                
                <DocumentsList documents={this.props.documents} currentDocumentId={this.props.currentDocumentId} goToDocument={this.props.goToDocument} />

                <Button bsStyle="primary" bsSize="lg" onClick={this.reject}>Next Document</Button>
            </div>
        );
    }
}

const RejectAndNext = connect<{}, {}, RejectAndNextProps>(
    (state: Sign.State) => {
        const selector = formValueSelector(Sign.FormName.REJECT);
        const rejectReason = selector(state, 'rejectReason');

        return { rejectReason };
    },
    { rejectDocument }
)(UnconnectedRejectAndNext);

interface RejectAndSubmitProps {
    currentDocumentId: string;
    documents: DocumentWithStatus[];
    goToDocument: (documentId: string) => void;
    submitPayload: Sign.Actions.SubmitDocumentSetPayload;
}

interface InjectedRejectAndSubmitProps {
    rejectReason: string;
    rejectDocument: (payload: Sign.Actions.RejectDocumentPayload) => void;
    submitDocumentSet: (payload: Sign.Actions.SubmitDocumentSetPayload) => void;
}

type UnconnectedRejectAndSubmitProps = RejectAndSubmitProps & InjectedRejectAndSubmitProps;

class UnconnectedRejectAndSubmit extends React.PureComponent<UnconnectedRejectAndSubmitProps> {
    constructor(props: UnconnectedRejectAndSubmitProps) {
        super(props);
        this.rejectAndSubmit = this.rejectAndSubmit.bind(this);
    }

    rejectAndSubmit() {
        this.props.rejectDocument({
            documentId: this.props.currentDocumentId,
            reason: this.props.rejectReason
        });
        this.props.submitDocumentSet(this.props.submitPayload);
    }

    render() {
        return (
            <div>
                <i className="fa fa-pencil modal-icon" aria-hidden="true"></i>

                <p className='text-center'>Are you sure you want to <strong>reject</strong> signing this document and submit all documents? The inviter will be notified.</p>

                <RejectReduxForm />

                <DocumentsList documents={this.props.documents} currentDocumentId={this.props.currentDocumentId} goToDocument={this.props.goToDocument} />

                <Button bsStyle='primary' bsSize="lg" onClick={this.rejectAndSubmit}>Reject &amp; Submit</Button>
            </div>
        );
    }
}

const RejectAndSubmit = connect<{}, {}, RejectAndSubmitProps>(
    (state: Sign.State) => {
        const selector = formValueSelector(Sign.FormName.REJECT);
        const rejectReason = selector(state, 'rejectReason');

        return { rejectReason };
    },
    { rejectDocument, submitDocumentSet }
)(UnconnectedRejectAndSubmit);

class SignConfirmation extends React.PureComponent<UnconnectedSignConfirmationProps> {
    constructor(props: UnconnectedSignConfirmationProps) {
        super(props);
        this.goToDocument = this.goToDocument.bind(this);
    }

    goToDocument(documentId: string) {
        this.props.push(signDocumentRoute(this.props.documentSetId, documentId, this.props.isDocumentOwner));
        this.props.closeModal();
    }

    render() {
        let title: string = null;
        let body: JSX.Element = null;

        if (this.props.signRequestStatus === Sign.DownloadStatus.InProgress) {
            title = 'Submitting Documents';
            body = <LoadingModalBody />;
        }
        else if (this.props.reject) {
            if (this.props.nextDocumentId) {
                title = 'Reject & Continue';
                body = <RejectAndNext documents={this.props.documents} currentDocumentId={this.props.documentId} nextDocumentId={this.props.nextDocumentId} goToDocument={this.goToDocument} />
            }
            else {
                title = 'Reject & Submit All';
                body = <RejectAndSubmit currentDocumentId={this.props.documentId} documents={this.props.documents} goToDocument={this.goToDocument} submitPayload={this.props.submitPayload} />
            }
        }
        else {
            if (this.props.nextDocumentId) {
                title = 'Sign & Continue';
                body = <SignAndNext
                            documents={this.props.documents}
                            currentDocumentId={this.props.documentId}
                            nextDocumentId={this.props.nextDocumentId}
                            markDocumentAsComplete={this.props.markDocumentAsComplete}
                            goToDocument={this.goToDocument} />
            }
            else {
                title = 'Sign & Submit All';
                body = <SignAndSubmit
                            currentDocumentId={this.props.documentId}
                            documents={this.props.documents}
                            recipients={this.props.recipients}
                            submitPayload={this.props.submitPayload}
                            markDocumentAsComplete={this.props.markDocumentAsComplete}
                            goToDocument={this.goToDocument}
                            submitDocumentSet={this.props.submitDocumentSet} />
            }
        }

        return (
            <Modal backdrop='static' show={true} onHide={this.props.closeModal} className="icon-modal">
                <Modal.Header closeButton>
                    <Modal.Title>{ title }</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {body}
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

export default connect<{}, {}, SignConfirmationProps>(
    (state: Sign.State) => {
        const { documentId, documentSetId } = state.modals;

        const documentSet = state.documentSets[state.modals.documentSetId];
        const recipients = documentSet ? documentSet.recipients : null;

        const documentIds = state.documentSets[state.modals.documentSetId].documentIds;
        const nextDocumentId = getNextDocument(documentIds, state.documentViewer.documents, state.modals.documentId);

        const documents = documentIds.map(documentId => ({
            id: documentId,
            ...state.documents[documentId],
            signStatus: (state.documentViewer.documents[documentId] || { signStatus: Sign.SignStatus.PENDING }).signStatus
        }));

        return {
            documentId, documentSetId, documents, recipients, nextDocumentId,
            signRequestStatus: state.documentViewer.signRequestStatus,
            isDocumentOwner: state.modals.isDocumentOwner,
            submitPayload: prepareSubmitPayload(documentSetId, state.documentSets[documentSetId], state.documentViewer)
        }
    },
    { submitDocumentSet, push, closeModal: () => closeModal({modalName: Sign.ModalType.SIGN_CONFIRMATION}), markDocumentAsComplete },
)(SignConfirmation);