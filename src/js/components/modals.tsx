import  * as React from "react";
<<<<<<< HEAD
import { SignatureModal } from './signatureSelector';
import { ResultsModal } from './results';
=======
import { SignatureModal, InitialsModal } from './signatureSelector';
>>>>>>> ca37707bd98229f6176d3c8596ce2316452ae4ed
import { connect } from 'react-redux';
import { closeShowingModal } from '../actions/index';

class Modals extends React.PureComponent<any>{
    render() {
        switch(this.props.showing){
            case 'selectSignature':
                return <SignatureModal hideModal={this.props.closeShowingModal} />;
            case 'results':
                return <ResultsModal hideModal={this.props.closeShowingModal} />;
            case 'selectInitial':
                return <InitialsModal hideModal={this.props.closeModal} />
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
        closeShowingModal: closeShowingModal,
    }
)(Modals)
