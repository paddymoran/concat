import  * as React from "react";
import { ResultsModal } from '../results';
import { SignatureModal, InitialsModal } from '../signatureSelector';
import { connect } from 'react-redux';
import { closeModal } from '../../actions/index';
import SignConfirmation from './signConfirmation';
import SubmitConfirmation from './submitConfirmation';
import Failure from './failure';
import Invite from './invite';
import EmailDocument from './emailDocument';
import RejectConfirmation from './rejectConfirmation';
import NextDocument from './nextDocument';
import ActivateControl from './activateControl';

interface ModalsProps {
    showing: string;
    payload: { [key: string]: any };
}

class Modals extends React.PureComponent<ModalsProps>{
    render() {
        const payload = this.props.payload;

        switch(this.props.showing){
            case 'selectSignature':
                return <SignatureModal />

            case 'results':
                return <ResultsModal />

            case 'selectInitial':
                return <InitialsModal />

            case Sign.ModalType.SIGN_CONFIRMATION:
                return <SignConfirmation />

            case Sign.ModalType.SUBMIT_CONFIRMATION:
                return <SubmitConfirmation />

            case Sign.ModalType.FAILURE:
                return <Failure />

            case Sign.ModalType.INVITE:
                return <Invite />

            case Sign.ModalType.EMAIL_DOCUMENT:
                return <EmailDocument />

            case Sign.ModalType.REJECT_CONFIRMATION:
                return <RejectConfirmation />

            case Sign.ModalType.NEXT_DOCUMENT:
                return <NextDocument />

            case Sign.ModalType.ACTIVATE_CONTROL:
                return <ActivateControl documentId={payload.documentId} isDocumentOwner={payload.isDocumentOwner} requestPrompts={payload.requestPrompts} requestedSignatureInfo={payload.requestedSignatureInfo} documentSetId={payload.documentSetId} />

            default:
                return false;
        }
    }
}


export default connect(
    (state: Sign.State) => ({
        showing: state.modals.showing,
        payload: state.modals
    })
)(Modals)
