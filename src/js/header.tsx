import * as React from "react";


export default class Header extends React.Component<{}, {}> {
    render() {
        return (
            <div className="header">
                <nav className="navbar navbar-default">
                    <div className='container'>
                        <div className='navbar-header'>
                            <img src="/images/catalex-sign.png" alt="CataLex Sign"/>
                        </div>

                        <ul className='account-nav'>
                            <li><a href="https://users.catalex.nz/user/profile">My Profile</a></li>
                            <li><a href="/logout">Logout</a></li>
                        </ul>
                    </div>
                </nav>
            </div>
        )
       }
}
