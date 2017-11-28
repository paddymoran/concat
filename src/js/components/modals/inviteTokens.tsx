import * as React from 'react';
import { Button,  ButtonToolbar, FormGroup, FormControl, InputGroup } from 'react-bootstrap';
import Modal from './modal';
import { connect } from 'react-redux';
import { closeModal, requestInviteToken } from '../../actions';
import {  stringToDateTime } from '../../utils'
import { submit } from 'redux-form';


interface InviteTokenProps {
    documentSetId: string;
    recipients: Recipients;
    inviteTokens: Sign.InviteTokens;
    hideModal: () => void;
    requestInviteToken: (payload: Sign.Actions.RequestInviteTokenPayload) => void;
}

type Recipients = {
    [email: string]: string;
}

function copyToClipBoard(id: string) {
    const elem = document.querySelector(id) as HTMLInputElement ;
    var currentFocus = document.activeElement;
    elem.focus();
    elem.setSelectionRange(0, elem.value.length);
    try {
       document.execCommand("copy");
    } catch(e) {
    }
}


class InviteTokens extends React.PureComponent<InviteTokenProps> {
    constructor(props: InviteTokenProps) {
        super(props);
    }

   renderButton(recipient: string, status: Sign.DownloadStatus){
        switch(status){
            case Sign.DownloadStatus.InProgress:
                return <Button>Loading</Button>;
            case Sign.DownloadStatus.Complete:
                return  false;
            case Sign.DownloadStatus.Failed:
                return <Button onClick={() => this.props.requestInviteToken({email: recipient, documentSetId: this.props.documentSetId})}>Failed. Click to try again</Button>
            default:
                return <Button onClick={() => this.props.requestInviteToken({email: recipient, documentSetId: this.props.documentSetId})}>Get URL</Button>

        }
    }

    row(recipient: string, index: number){
        const status = this.props.inviteTokens && this.props.inviteTokens[recipient] && this.props.inviteTokens[recipient].status;
        return [<tr key={`${recipient}-row`}>
        <td>{ this.props.recipients[recipient] }</td>
        <td>{ recipient }</td>
         <td>
             { this.renderButton(recipient, status) }
          </td>
        </tr>,
        status === Sign.DownloadStatus.Complete && <tr key={`${recipient}-url`}>
            <td colSpan={3}>
                <FormGroup>
                  <InputGroup style={{width: '100%'}}>
                    <FormControl type="static" value={this.props.inviteTokens[recipient].url} readOnly={true} id={`copy-input-idx-${index}`}/>
                    <InputGroup.Button>
                      <Button onClick={() => copyToClipBoard(`#copy-input-idx-${index}`)}>Copy to Clipboard</Button>
                    </InputGroup.Button>
                    </InputGroup>
                </FormGroup>

            </td>

            </tr>

        ]
    }

    render() {
        return (
            <Modal backdrop='static' show={true} onHide={this.props.hideModal}>
                <Modal.Header closeButton>
                    <Modal.Title>URLs for Inviting Recipients</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                <table className="table">
                   <thead>
                   <tr>
                       <th>Name</th>
                       <th>Email</th>
                       <th></th>
                       </tr>
                   </thead>
                <tbody>
                    { Object.keys(this.props.recipients).map((recipient, index) => {
                        return this.row(recipient, index);
                    }) }
                    </tbody>
                    </table>
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
        const recipients = state.documentSets[state.modals.documentSetId].documentIds.reduce((recipients: Recipients, documentId, i : number) => {
            const document = state.documents[documentId];
            document.signatureRequestInfos && document.signatureRequestInfos.reduce((recipients: Recipients, request: Sign.SignatureRequestInfo) => {
                recipients[request.email] = request.name;
                return recipients;
            }, recipients);
            return recipients;
        }, {});

        return {
            documentSetId: state.modals.documentSetId,
            recipients,
            inviteTokens: state.inviteTokens[state.modals.documentSetId]

        };
    },
    {
        hideModal: () => closeModal({modalName: Sign.ModalType.INVITE_TOKENS}), requestInviteToken,
    }
)(InviteTokens);