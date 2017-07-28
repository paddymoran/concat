import * as React from 'react';
import { Link } from 'react-router';
import { Col, Row } from 'react-bootstrap';


export default class SelectWorkflow extends React.Component<{}, {}> {
    render() {
        return (
            <div className='container'>
                <div className='page-heading'>
                <h1 className="title question">Who needs to sign?</h1>
                <div className="sub-title step-count">Step 1</div>
                </div>
                <Row>
                     <Col md={4}>
                    <Link className='workflow-option-wrapper enabled' to='selfsign'>
                        <span className='workflow-option'>
                            <span className='fa fa-user icon' aria-hidden='true'></span>
                            <h2>Only me</h2>
                        </span>
                    </Link>
                    </Col>
                    <Col md={4}>
                    <a className='workflow-option-wrapper disabled'>
                        <span className='workflow-option'>
                            <span className='fa fa-user-plus icon' aria-hidden='true'></span>
                            <h2>Myself and others</h2>
                        </span>
                    </a>
                    </Col>
                     <Col md={4}>
                    <a className='workflow-option-wrapper disabled'>
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