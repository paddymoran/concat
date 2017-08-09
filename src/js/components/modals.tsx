import  * as React from "react";
import { SignatureModal } from './signatureSelector';
import { connect } from 'react-redux';
import { hideSignatureSelection } from '../actions/index';

class Modals extends React.PureComponent<any>{
    render() {
        switch(this.props.showing){
            case 'selectSignature':
                return <SignatureModal hideModal={this.props.hideSignatureSelection}/>
        }
        return false;
    }
}


export default connect(
    (state: Sign.State) => ({
        showing: state.modals.showing,
    }),
    {
        hideSignatureSelection: hideSignatureSelection,
    }
)(Modals)
