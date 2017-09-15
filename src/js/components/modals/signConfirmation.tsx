import * as React from 'react';
import { reduxForm, Field, InjectedFormProps, formValueSelector, WrappedFieldProps } from 'redux-form';
import { Modal, Button, Form, ControlLabel, FormGroup, FormControl } from 'react-bootstrap';
import { connect } from 'react-redux';
import { closeModal, markDocumentAsComplete, submitDocumentSet, rejectDocument } from '../../actions';
import { push } from 'react-router-redux';
import { signDocumentRoute, getNextDocument } from '../../utils';
import { SignStatus } from '../requestedSignatures';
import { Checkbox } from 'react-bootstrap';

function prepareSubmitPayload(documentSetId: string, documentSet: Sign.DocumentSet, documentViewer: Sign.DocumentViewer): Sign.Actions.SubmitDocumentSetPayload {
    const prompts = Object.keys(documentViewer.prompts).reduce((acc: any, key: string) => {
        const prompt: Sign.DocumentPrompt = documentViewer.prompts[key];
        if (documentSet.documentIds.indexOf(prompt.documentId) >= 0) {
            acc[prompt.value.recipientEmail] = [...(acc[prompt.value.recipientEmail] || []), prompt];
        }
        return acc;
    }, {});
    const recipients = (documentSet.recipients || []).reduce((acc: any, r) => {
        acc[r.email] = r;
        return acc;
    }, {});

    if (Object.keys(prompts).length) {
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
    isSigning: boolean;
}

type UnconnectedSignConfirmationProps = SignConfirmationProps & InjectedSignConfirmationProps;

interface RecipientsListProps {
    recipients: Sign.Recipients;
    showMessage: boolean;
}

class ShowMessageField extends React.PureComponent<WrappedFieldProps> {
    render() {
        return <Checkbox {...this.props.input}>Send a custom message to recipients</Checkbox>
    }
}


class MessageField extends React.PureComponent<WrappedFieldProps> {
    render() {
        return <FormControl {...this.props.input} componentClass="textarea" placeholder="Custom Message" />
    }
}

class SendMessageForm extends React.PureComponent<InjectedFormProps & {showMessage: boolean}> {
    render() {
        return (
            <Form className="text-left">
                <FormGroup>
                <div className="text-center"><Field name="showMessage" component={ShowMessageField as any} /></div>
                    { this.props.showMessage &&  <Field name="message" component={MessageField as any} /> }
                </FormGroup>
            </Form>
        );
    }
}

export const ConnectedSendMessageForm = reduxForm<{ showMessage: boolean; }>(
    { form: Sign.FormName.RECIPIENT_MESSAGE }
)(SendMessageForm) as any;


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

              <ConnectedSendMessageForm showMessage={this.props.showMessage}/>

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
         if(this.props.documents.length){
             return false;
         }
        return (
            <div>
                <h3>Other Documents</h3>

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

class LoadingModalBody extends React.PureComponent<{isSigning: boolean}> {
    render() {
        return (
            <div>
                <div className='loading' />
                { this.props.isSigning && <p>Signing document, please wait.</p> }
                { !this.props.isSigning && <p>Sending document, please wait.</p> }
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
        this.goToDocument = this.goToDocument.bind(this);
    }

    next() {
        this.goToDocument(this.props.nextDocumentId);
    }

    goToDocument(documentId: string) {
        this.props.markDocumentAsComplete({ documentId: this.props.currentDocumentId, complete: true });
        this.props.goToDocument(documentId);
    }

    render() {
        return (
            <div>
                <i className="fa fa-forward modal-icon" aria-hidden="true"></i>

                <p className='text-center'>Are you sure you want to move to the next document?</p>

                <DocumentsList documents={this.props.documents} currentDocumentId={this.props.currentDocumentId} goToDocument={this.goToDocument} />

                <Button bsStyle='primary' bsSize="lg" onClick={this.next}>Next Document</Button>
            </div>
        );
    }
}

interface SignAndSubmitProps {
    currentDocumentId: string;
    documentSetId: string;
    documents: DocumentWithStatus[];
    submitPayload: Sign.Actions.SubmitDocumentSetPayload;
    goToDocument: (documentId: string) => void;
    submitDocumentSet: (payload: Sign.Actions.SubmitDocumentSetPayload) => void;
    markDocumentAsComplete: (payload: Sign.Actions.MarkDocumentAsCompletePayload) => void;
    isSigning: boolean;
}

interface InjectedSignAndSubmitProps {
    isSigning: boolean;
    isRequestingSignatures: boolean;
    recipients: Sign.Recipients;
    showMessage: boolean;
    message: string;
}

type ConnectedSignAndSubmitProps = SignAndSubmitProps & InjectedSignAndSubmitProps;

class UnconnectedSignAndSubmit extends React.PureComponent<ConnectedSignAndSubmitProps> {
    constructor(props: ConnectedSignAndSubmitProps) {
        super(props);
        this.sign = this.sign.bind(this);
        this.goToDocument = this.goToDocument.bind(this);
    }

    sign() {
        let payload = this.props.submitPayload;
        this.props.markDocumentAsComplete({ documentId: this.props.currentDocumentId, complete: true });
        if(this.props.recipients && this.props.recipients.length && this.props.showMessage && this.props.message){
            payload = {...payload};
            payload.signatureRequests = payload.signatureRequests.map((r: Sign.SignatureRequest) => {
                return {...r, recipient: {...r.recipient, message: this.props.message}}
            })
        }
        this.props.submitDocumentSet(payload);
    }

    goToDocument(documentId: string) {
        this.props.markDocumentAsComplete({ documentId: this.props.currentDocumentId, complete: true });
        this.props.goToDocument(documentId);
    }

    render() {
        const documentsNoun = this.props.documents.length === 1 ? { titleCase: 'Document', sentenceCase: 'this document' }: { titleCase: 'Documents', sentenceCase: 'these documents' };

        let message = null;
        let signString = null;

        if (this.props.isSigning) {
            if (this.props.isRequestingSignatures) {
                message = 'Are you sure you want to sign and send ' + documentsNoun.sentenceCase + '?';
                signString = 'Sign & Send ' + documentsNoun.titleCase;
            }
            else {
                message = 'Are you sure you want to sign ' + documentsNoun.sentenceCase + '?';
                signString = 'Sign ' + documentsNoun.titleCase;
            }
        }
        else {
            message = 'Are you sure you want to send ' + documentsNoun.sentenceCase + '?';
            signString = 'Send ' + documentsNoun.titleCase;
        }

        return (
            <div>
                <i className="fa fa-pencil modal-icon" aria-hidden="true"></i>

                <p className='text-center'>{message}</p>

                {this.props.recipients && this.props.recipients.length && <RecipientsList recipients={this.props.recipients} ref="recipients" showMessage={this.props.showMessage}/> }

                <DocumentsList documents={this.props.documents} currentDocumentId={this.props.currentDocumentId} goToDocument={this.goToDocument} />

                <Button bsStyle='primary' bsSize="lg" onClick={this.sign}>{signString}</Button>
            </div>
        );
    }
}
const messageSelector = formValueSelector(Sign.FormName.RECIPIENT_MESSAGE);
const SignAndSubmit = connect<{}, {}, SignAndSubmitProps>(
    (state: Sign.State, ownProps: SignAndSubmitProps) => {
        const documentSet = state.documentSets[ownProps.documentSetId];
        const { message, showMessage } = messageSelector(state, 'message', 'showMessage');
        const documentIds = documentSet.documentIds;

        return {
            message, showMessage,
            isRequestingSignatures: documentSet.recipients ? documentSet.recipients.length > 0 : false,
            recipients: documentSet.recipients,
        }
    }
)(UnconnectedSignAndSubmit);

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
        this.goToDocument = this.goToDocument.bind(this);
    }

    reject() {
        this.goToDocument(this.props.nextDocumentId);
    }

    goToDocument(documentId: string) {
        this.props.rejectDocument({
            documentId: this.props.currentDocumentId,
            reason: this.props.rejectReason
        });
        this.props.goToDocument(documentId);
    }

    render() {
        return (
            <div>
                <i className="fa fa-exclamation modal-icon" aria-hidden="true"></i>

                <p className='text-center'>Are you sure you want to <strong>reject</strong> signing this document and go to the next document? The inviter will be notified.</p>

                <RejectReduxForm />

                <DocumentsList documents={this.props.documents} currentDocumentId={this.props.currentDocumentId} goToDocument={this.goToDocument} />

                <Button bsStyle="primary" bsSize="lg" onClick={this.reject}>Next Document</Button>
            </div>
        );
    }
}

const rejectSelector = formValueSelector(Sign.FormName.REJECT);
const RejectAndNext = connect<{}, {}, RejectAndNextProps>(
    (state: Sign.State) => {
        const rejectReason = rejectSelector(state, 'rejectReason');
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
        this.goToDocument = this.goToDocument.bind(this);
    }

    rejectAndSubmit() {
        this.props.rejectDocument({
            documentId: this.props.currentDocumentId,
            reason: this.props.rejectReason
        });
        this.props.submitDocumentSet(this.props.submitPayload);
    }

    goToDocument(documentId: string) {
        this.props.rejectDocument({
            documentId: this.props.currentDocumentId,
            reason: this.props.rejectReason
        });
        this.props.goToDocument(documentId);
    }

    render() {
        return (
            <div>
                <i className="fa fa-pencil modal-icon" aria-hidden="true"></i>

                <p className='text-center'>Are you sure you want to <strong>reject</strong> signing this document and submit all documents? The inviter will be notified.</p>

                <RejectReduxForm />

                <DocumentsList documents={this.props.documents} currentDocumentId={this.props.currentDocumentId} goToDocument={this.goToDocument} />

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
            body = <LoadingModalBody isSigning={this.props.isSigning}/>;
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
                            documentSetId={this.props.documentSetId}
                            documents={this.props.documents}
                            submitPayload={this.props.submitPayload}
                            markDocumentAsComplete={this.props.markDocumentAsComplete}
                            goToDocument={this.goToDocument}
                            isSigning={this.props.isSigning}
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

export function isSigning(documentViewer: Sign.DocumentViewer, documentIds: string[]) {
    const signaturesIndexes = Object.keys(documentViewer.signatures).filter(signatureIndex => documentIds.indexOf(documentViewer.signatures[signatureIndex].documentId) >= 0);
    const dateIndexes = Object.keys(documentViewer.dates).filter(dateIndex => documentIds.indexOf(documentViewer.dates[dateIndex].documentId) >= 0);
    const textIndexes = Object.keys(documentViewer.texts).filter(textIndex =>  documentIds.indexOf(documentViewer.texts[textIndex].documentId) >= 0);
    const promptIndexes = Object.keys(documentViewer.prompts).filter(textIndex => documentIds.indexOf(documentViewer.prompts[textIndex].documentId) >= 0);

    const hasSignature = !!signaturesIndexes.length;
    const hasInitial = !!signaturesIndexes.length;
    const hasDate = !!dateIndexes.length;
    const hasText = !!textIndexes.length;

    return hasSignature || hasInitial || hasDate || hasText;
}

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
            isSigning: isSigning(state.documentViewer, documentIds),
            submitPayload: prepareSubmitPayload(documentSetId, state.documentSets[documentSetId], state.documentViewer)
        }
    },
    { submitDocumentSet, push, closeModal: () => closeModal({modalName: Sign.ModalType.SIGN_CONFIRMATION}), markDocumentAsComplete },
)(SignConfirmation);