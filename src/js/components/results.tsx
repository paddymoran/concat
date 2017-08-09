import  * as React from "react";
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';


class Results extends React.PureComponent<any> {
    render() {
        return  <Modal  show={true} onHide={this.props.hideModal} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Document Signed</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <p className="text-center">Your signed PDF is ready to download.</p>
                    <p />
                    <p />
                       <a target="_blank" href={'/api/document/' + this.props.resultsData.resultDocumentId} className='workflow-option-wrapper enabled'>
                            <span className='workflow-option'>
                                <span className='fa fa-download icon' aria-hidden='true'></span>
                                <h2>Download</h2>
                            </span>
                        </a>



                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.props.hideModal}>Close</Button>
            </Modal.Footer>
        </Modal>
    }
}


export const ResultsModal = connect((state: Sign.State) => ({
    resultsData: state.modals.results
}), {

})(Results)