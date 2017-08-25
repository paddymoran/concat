import  * as React from "react";
import { ResultsModal } from '../results';
import { SignatureModal, InitialsModal } from '../signatureSelector';
import { connect } from 'react-redux';
import { closeModal } from '../../actions/index';
import SignConfirmation from './signConfirmation';
import SubmitConfirmation from './submitConfirmation';
import Failure from './failure';

interface ModalsProps {
    showing: string;
    //closeModal: (payload: Sign.Actions.CloseModalPayload) => void;
}

class Modals extends React.PureComponent<ModalsProps>{
    render() {
        switch(this.props.showing){
            case 'selectSignature':
                return <SignatureModal />;

            case 'results':
                return <ResultsModal  />;

            case 'selectInitial':
                return <InitialsModal />;

            case Sign.ModalType.SIGN_CONFIRMATION:
                return <SignConfirmation />

            case Sign.ModalType.SUBMIT_CONFIRMATION:
                return <SubmitConfirmation />

            case Sign.ModalType.FAILURE:
                return <Failure />

            default:
                return false;
        }
    }
}


export default connect(
    (state: Sign.State) => ({
        showing: state.modals.showing
    })
)(Modals)
