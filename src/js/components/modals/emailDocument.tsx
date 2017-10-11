import * as React from 'react';
import { connect } from 'react-redux';
import {  ButtonToolbar, Button } from 'react-bootstrap';
import Modal from './modal';
import { closeModal, emailDocuments } from '../../actions';
import { InviteForm } from '../selectRecipients';
import { submit } from 'redux-form';
import Loading from '../loading';

interface EmailDocumentsProps {
    documentIds: string[];
    status: Sign.DownloadStatus;
    closeModal: () => void;
    submit: () => void;
    emailDocuments: (payload: Sign.Actions.EmailDocumentsPayload) => void;
    totalSize: number;
}

const MAX_SIZE = 20000000;

class EmailDocuments extends React.PureComponent<EmailDocumentsProps> {
    constructor(props: EmailDocumentsProps) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(values: { recipients: Sign.Recipients }) {
        this.props.emailDocuments({
            documentIds: this.props.documentIds,
            recipients: values.recipients
        });
    }

    renderBody() {
        return <div>
            {this.props.status === Sign.DownloadStatus.NotStarted && <InviteForm initialValues={{ recipients: [{}] }} onSubmit={this.onSubmit} />}
            {this.props.status === Sign.DownloadStatus.InProgress && <Loading />}
            {this.props.status === Sign.DownloadStatus.Complete &&
                <div>
                    <i className="fa fa-check modal-icon" aria-hidden="true"></i>

                    <p className='text-center'>{this.props.documentIds.length > 1 ? 'Documents' : 'Document'} Sent!</p>
                </div>
            }
            {this.props.status === Sign.DownloadStatus.Failed &&
                <div>
                    <i className="fa fa-exclamation modal-icon" aria-hidden="true"></i>

                    <p className='text-center'>An error occurred, please close and try again.</p>
                </div>
            }

        </div>
    }

    renderTooLarge() {
        return  <div>
                    <i className="fa fa-exclamation modal-icon" aria-hidden="true"></i>

                    <p className='text-center'>Sorry, we can not send {this.props.documentIds.length > 1 ? 'files' : 'a file'} this large.</p>
                </div>
    }

    render() {
        let classes = '';
        const valid = this.props.totalSize < MAX_SIZE;
        if (this.props.status === Sign.DownloadStatus.Complete || this.props.status === Sign.DownloadStatus.Failed || !valid) {
            classes += ' icon-modal'
        }

        return (
            <Modal backdrop='static' show={true} onHide={this.props.closeModal} className={classes}>
                <Modal.Header closeButton>
                    <Modal.Title>Email {this.props.documentIds.length > 1 ? 'Documents' : 'Document'}</Modal.Title>
                </Modal.Header>

                <Modal.Body>

                { valid && this.renderBody() }
                { !valid && this.renderTooLarge() }

                </Modal.Body>

                <Modal.Footer>
                    <ButtonToolbar className="pull-right">
                        <Button onClick={this.props.closeModal}>Close</Button>
                        { valid && this.props.status === Sign.DownloadStatus.NotStarted && <Button bsStyle="primary" onClick={this.props.submit}>Send</Button>}
                    </ButtonToolbar>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default connect(
    (state: Sign.State) => ({
        documentIds: state.modals.documentIds,
        status: state.modals.status,
        totalSize: state.modals.documentIds.reduce((size: number, documentId: string) => {
             return size + (state.documents[documentId].size || 0)
        }, 0)
    }),
    {
        emailDocuments,
        submit: () => submit(Sign.FormName.RECIPIENTS),
        closeModal: () => closeModal({ modalName: Sign.ModalType.EMAIL_DOCUMENT })
    }
)(EmailDocuments)