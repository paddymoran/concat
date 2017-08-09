import  * as React from "react";
import { SignatureModal } from './signatureSelector';
import { connect } from 'react-redux';
import { closeShowingModal } from '../actions/index';

class Modals extends React.PureComponent<any>{
    render() {
        switch(this.props.showing){
            case 'selectSignature':
                return <SignatureModal hideModal={this.props.closeModal}/>
        }
        return false;
    }
}


export default connect(
    (state: Sign.State) => ({
        showing: state.modals.showing,
    }),
    {
        closeModal: closeShowingModal,
    }
)(Modals)
