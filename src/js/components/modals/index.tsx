import  * as React from "react";
import { ResultsModal } from '../results';
import { SignatureModal, InitialsModal } from '../signatureSelector';
import { connect } from 'react-redux';
import { closeModal } from '../../actions/index';
import SignConfirmation from './signConfirmation';

interface ModalsProps {
    showing: string;
    closeModal: (payload: Sign.Actions.CloseModalPayload) => void;
}

class Modals extends React.PureComponent<ModalsProps>{
    render() {
        const hideModal = () => this.props.closeModal({ modalName: this.props.showing });

        switch(this.props.showing){
            case 'selectSignature':
                return <SignatureModal hideModal={hideModal} />;
            
            case 'results':
                return <ResultsModal hideModal={hideModal} />;
            
            case 'selectInitial':
                return <InitialsModal hideModal={hideModal} />;

            case Sign.ModalType.SIGN_CONFIRMATION:
                return <SignConfirmation hideModal={hideModal} />
            
            default:
                return false;
        }
    }
}


export default connect(
    (state: Sign.State) => ({
        showing: state.modals.showing
    }),
    {
        closeModal: closeModal,
    }
)(Modals)
