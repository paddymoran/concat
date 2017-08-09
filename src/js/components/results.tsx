import  * as React from "react";
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';


class Results extends React.PureComponent<any> {
    render() {
        return  <Modal  show={true} onHide={this.props.hideModal}>
            <Modal.Header closeButton>
                <Modal.Title>Results</Modal.Title>
            </Modal.Header>
            <Modal.Body>

            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.props.hideModal}>Close</Button>
            </Modal.Footer>
        </Modal>
    }
}


export const ResultsModal = connect(() => {

}, {

})(Results)