import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { generateUUID } from './uuid';

interface SelectWorkflowProps {
    openSelfSign: () => void;
    openOthersSign: () => void;
}

class UnconnectedSelectWorkflow extends React.PureComponent<SelectWorkflowProps> {
    render() {
        return (
            <div>
                <div className='page-heading'>
                    <h1 className="title question">Who needs to sign?</h1>
                    <div className="sub-title step-count">Step 1</div>
                </div>
                <Row>
                    <Col sm={6}>
                        <a className='workflow-option-wrapper enabled' onClick={() => generateUUID().then(this.props.openSelfSign)}>
                            <span className='workflow-option'>
                                <span className='fa fa-user icon' aria-hidden='true'></span>
                                <h2>Only me</h2>
                            </span>
                        </a>
                    </Col>

                    <Col sm={6}>
                        <a className='workflow-option-wrapper enabled' onClick={() => generateUUID().then(this.props.openOthersSign)}>
                            <span className='workflow-option'>
                                <span className='fa fa-users icon' aria-hidden='true'></span>
                                <h2>Invite others</h2>
                            </span>
                        </a>
                    </Col>
                </Row>
            </div>
        );
    }
}

export const SelectWorkflow = connect(
    undefined,
    {
        openSelfSign: (uuid: string) => push(`/self_sign/${uuid}`),
        openOthersSign: (uuid: string) => push(`/others_sign/${uuid}`),
    }
)(UnconnectedSelectWorkflow);



interface SelectAnnotationProps {
    documentSetId: string;
}

class UnconnectedSelectAnnotation extends React.PureComponent<SelectAnnotationProps> {
    render() {
        return (
            <div>
                <div className='page-heading'>
                    <h1 className="title question">Do you wish to annotate these documents?</h1>
                    <div className="sub-title step-count">Step 4</div>
                </div>
                <Row>
                    <Col sm={6}>
                        <a className='workflow-option-wrapper disabled' onClick={() => {}}>
                            <span className='workflow-option'>
                                <span className='fa fa-clipboard icon' aria-hidden='true'></span>
                                <h2>Yes, I will select who needs to sign and where</h2>
                            </span>
                        </a>
                    </Col>

                    <Col sm={6}>
                        <a className='workflow-option-wrapper enabled'>
                            <span className='workflow-option'>
                                <span className='fa fa-send icon' aria-hidden='true'></span>
                                <h2>No, just inform the recipients</h2>
                            </span>
                        </a>
                    </Col>
                </Row>
            </div>
        );
    }
}

export const SelectAnnotation = connect(
    (state: Sign.State, ownProps: any) => {
        const { documentSetId } = ownProps.params;
        return {
            documentSetId,
        };
    }
)(UnconnectedSelectAnnotation);