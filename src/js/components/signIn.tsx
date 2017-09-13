import * as React from 'react';


export default class Sign extends React.PureComponent<{}>  {
    render() {
        return (
            <div >
                <div className="page-heading"><h1 className="title">Please Sign In</h1></div>
                <div className="text-center">
                    Click <a href='https://users.catalex.nz'>here</a> to sign in or create an account.
                </div>
            </div>
        );
    }
}

