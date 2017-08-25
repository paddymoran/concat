import * as React from 'react';
import { connect } from 'react-redux';
import { requestRequestedSignatures } from '../actions';
import * as moment from 'moment';


interface DocumentSets {
    requestRequestedSignatures: () => void;
}



class UnconnectedLanding extends React.PureComponent<DocumentSets>  {
    componentDidMount() {
        this.props.requestRequestedSignatures()
    }
    render() {
        return (
                <div>
                Hi.  I've loaded your requested signatures in the background.  I better render them soon.
                </div>
        );
    }
}


const Landing = connect((state: Sign.State) => ({

}), {
    requestRequestedSignatures
})(UnconnectedLanding);

export default Landing;