import * as React from 'react';
import sizeMe from 'react-sizeme';
import { connect } from 'react-redux';
import { updateDocumentWidth } from '../actions';

interface WidthProps {
    size?: {
        width: number
    },
    updateDocumentWidth: (payload: Sign.Actions.UpdateDocumentWidthPayload) => void
}

class WidthSpy extends React.PureComponent<WidthProps> {
    componentDidMount() {
        if(this.props.size.width){
            this.props.updateDocumentWidth({width: Math.floor(this.props.size.width)});
        }
    }
    componentDidUpdate() {
        if(this.props.size.width){
            this.props.updateDocumentWidth({width: Math.floor(this.props.size.width)});
        }
    }
    render() {
        return <div style={{width: '100%'}} />
    }
}

const ConnectedWidthSpy = connect(undefined, { updateDocumentWidth })(WidthSpy)

const SizedConnectedWidthSpy = sizeMe({refreshMode: 'debounce', monitorWidth: true})(ConnectedWidthSpy);

export default SizedConnectedWidthSpy;