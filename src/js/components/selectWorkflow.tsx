import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { generateUUID } from './uuid';

interface SelectWorkflowProps {
    openSelfSign: () => void;
    openOthersSign: () => void;
}

class SelectWorkflow extends React.Component<SelectWorkflowProps> {
    render() {
        return (
            <div className='container'>
                <div className='page-heading'>
                    <h1 className="title question">Who needs to sign?</h1>
                    <div className="sub-title step-count">Step 1</div>
                </div>
                <Row>
                    <Col sm={4}>
                        <a className='workflow-option-wrapper enabled' onClick={() => generateUUID().then(this.props.openSelfSign)}>
                            <span className='workflow-option'>
                                <span className='fa fa-user icon' aria-hidden='true'></span>
                                <h2>Only me</h2>
                            </span>
                        </a>
                    </Col>

                    <Col sm={4}>
                        <a className='workflow-option-wrapper disabled'>
                            <span className='workflow-option'>
                                <span className='fa fa-user-plus icon' aria-hidden='true'></span>
                                <h2>Myself and others</h2>
                            </span>
                        </a>
                    </Col>

                    <Col sm={4}>
                        <a className='workflow-option-wrapper enabled' onClick={() => generateUUID().then(this.props.openOthersSign)}>
                            <span className='workflow-option'>
                                <span className='fa fa-users icon' aria-hidden='true'></span>
                                <h2>Only others</h2>
                            </span>
                        </a>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default connect(
    undefined,
    {
        openSelfSign: (uuid: string) => push(`/self_sign/${uuid}`),
        openOthersSign: (uuid: string) => push(`/others_sign/${uuid}`),
    }
)(SelectWorkflow);