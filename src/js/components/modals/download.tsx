import * as React from 'react';
import { Button, Modal, ButtonToolbar } from 'react-bootstrap';
import { connect } from 'react-redux';
import { closeModal } from '../../actions';
import {  stringToDateTime } from '../../utils'
import { submit } from 'redux-form';

interface DownloadProps {
    documentSetId: string;
    documentSetLabel: string;
    hideModal: () => void;
}


class DownloadModal extends React.PureComponent<DownloadProps> {
    constructor(props: DownloadProps) {
        super(props);

    }

    render() {
        return (
            <Modal backdrop='static' show={true} onHide={this.props.hideModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Download Document Set</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                <p className="text-center">
                    <a className="btn btn-primary " target="_blank" href={`/api/download_set/${this.props.documentSetId}?datestring=${encodeURIComponent(this.props.documentSetLabel)}`}><i className="fa fa-file-zip-o" /> Download as a Zip file</a>
                </p>
                <p className="text-center"> - or - </p>
                 <p className="text-center">
                       <a className="btn btn-primary " target="_blank" href={`/api/concat_set/${this.props.documentSetId}?datestring=${encodeURIComponent(this.props.documentSetLabel)}`}><i className="fa fa-file-pdf-o" /> Merge into one PDF</a> </p>
                 <p className="text-center"><em>If you let us merge you can still use our verification system</em></p>
                </Modal.Body>

                <Modal.Footer>
                    <ButtonToolbar className="pull-right">
                        <Button onClick={this.props.hideModal}>Close</Button>
                    </ButtonToolbar>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default connect(
    (state: Sign.State) => {
        return {
            documentSetId: state.modals.documentSetId,
            documentSetLabel: stringToDateTime(state.documentSets[state.modals.documentSetId].createdAt)
        };
    },
    {
        hideModal: () => closeModal({modalName: Sign.ModalType.DOWNLOAD_ALL})
    }
)(DownloadModal);