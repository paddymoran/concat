import * as React from 'react';
import { connect } from 'react-redux';
import { Modal, ButtonToolbar, Button } from 'react-bootstrap';
import { closeModal, emailDocument } from '../../actions';
import { InviteForm } from '../selectRecipients';
import { submit } from 'redux-form';
import Loading from '../loading';

interface EmailDocumentProps {
    documentId: string;
    status: Sign.DownloadStatus;
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
    }

    render() {
        let classes = '';

        if (this.props.status === Sign.DownloadStatus.Complete || this.props.status === Sign.DownloadStatus.Failed) {
            classes += ' icon-modal'
        }

        return (
            <Modal backdrop='static' show={true} onHide={this.props.closeModal} className={classes}>
                <Modal.Header closeButton>
                    <Modal.Title>Email Document</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {this.props.status === Sign.DownloadStatus.NotStarted && <InviteForm initialValues={{ recipients: [{}] }} onSubmit={this.onSubmit} />}
                    {this.props.status === Sign.DownloadStatus.InProgress && <Loading />}
                    {this.props.status === Sign.DownloadStatus.Complete &&
                        <div>
                            <i className="fa fa-check modal-icon" aria-hidden="true"></i>

                            <p className='text-center'>Document Sent!</p>
                        </div>
                    }
                    {this.props.status === Sign.DownloadStatus.Failed &&
                        <div>
                            <i className="fa fa-exclamation modal-icon" aria-hidden="true"></i>

                            <p className='text-center'>An error occurred, please close and try again.</p>
                        </div>
                    }

                </Modal.Body>

                <Modal.Footer>
                    <ButtonToolbar className="pull-right">
                        <Button onClick={this.props.closeModal}>Close</Button>
                        {this.props.status === Sign.DownloadStatus.NotStarted && <Button bsStyle="primary" onClick={this.props.submit}>Send</Button>}
                    </ButtonToolbar>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default connect(
    (state: Sign.State) => ({
        documentId: state.modals.documentId,
        status: state.modals.status,
    }),
    {
        emailDocument,
        submit: () => submit(Sign.FormName.RECIPIENTS),
        closeModal: () => closeModal({ modalName: Sign.ModalType.EMAIL_DOCUMENT })
    }
)(EmailDocument)