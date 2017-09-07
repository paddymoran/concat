import * as React from 'react';
import { Button, Modal, ButtonToolbar } from 'react-bootstrap';
import { connect } from 'react-redux';
import { closeModal } from '../../actions';

interface ConfirmActionModalProps {}

interface ConnectedConfirmActionModalProps extends ConfirmActionModalProps {
    title: string;
    message: string;
    submitText: string;
    closeModal: () => void;
    fireAction: () => void;
}

interface StateProps {
    title: string;
    message: string;
    submitText: string;
    action: any;
}

interface DispatchProps {
    closeModal: () => void;
    fireAction: (action: any) => void;
}

class ConfirmActionModal extends React.PureComponent<ConnectedConfirmActionModalProps, {loading: boolean}> {
    constructor(props: ConnectedConfirmActionModalProps) {
        super(props);
        this.submit = this.submit.bind(this);
        this.state = {loading: false}
    }

    submit() {
        this.props.fireAction();
        this.setState({loading: true});
    }
    render() {
        return (
            <Modal backdrop="static" show={true} onHide={this.props.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{ this.props.title }</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                   { !this.state.loading && <p>{ this.props.message }</p> }
                   { this.state.loading && <div className="loading"/> }
                </Modal.Body>

                 { !this.state.loading &&  <Modal.Footer>
                    <ButtonToolbar className="pull-right">
                        <Button onClick={this.props.closeModal}>Cancel</Button>
                        <Button onClick={this.submit} bsStyle="primary">{ this.props.submitText }</Button>
                    </ButtonToolbar>
                </Modal.Footer> }
            </Modal>
        );
    }
}

function mapStateToProps(state: Sign.State): StateProps {
    return {
        title: state.modals.title,
        message: state.modals.message,
        submitText: state.modals.submitText,
        action: state.modals.action
    };
}

const mapDispatchToProps = {
    closeModal: () => closeModal({ modalName: Sign.ModalType.CONFIRM_ACTION }),
    fireAction: (action: any) => action
};

function mergeProps(stateProps: StateProps, dispatchProps: DispatchProps): ConnectedConfirmActionModalProps {
    return {
        title: stateProps.title,
        message: stateProps.message,
        submitText: stateProps.submitText,
        closeModal: dispatchProps.closeModal,
        fireAction: () => dispatchProps.fireAction(stateProps.action)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)(ConfirmActionModal);