import * as React from 'react';
import { Link } from 'react-router';

export default class SelectWorkflow extends React.Component<{}, {}> {
    render() {
        return (
            <div className='container'>
                <h1 className="title">Select Workflow</h1>
                <div className="sub-title">Step 1</div>

                <div className='row'>
                    <Link className='col-md-4 workflow-option-wrapper' to='selfsign'>
                        <div className='workflow-option'>
                            <span className='glyphicon glyphicon-user' aria-hidden='true'></span>
                            <h2>Myself</h2>
                        </div>
                    </Link>
                    
                    <a className='col-md-4 workflow-option-wrapper'>
                        <div className='workflow-option'>
                            <span className='glyphicon glyphicon-th-list' aria-hidden='true'></span>
                            <h2>Myself and Others</h2>
                        </div>
                    </a>

                    <a className='col-md-4 workflow-option-wrapper'>
                        <div className='workflow-option'>
                            <span className='glyphicon glyphicon-road' aria-hidden='true'></span>
                            <h2>Only Others</h2>
                        </div>
                    </a>
                </div>
            </div>
        );
    }
}