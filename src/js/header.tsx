import * as React from "react";
import { Link } from 'react-router/'

export default class Header extends React.Component<{}, {}> {
    render() {
        return (
            <div className="header">
                <nav className="navbar navbar-default">
                    <div className='container'>
                        <Link to="/" className='navbar-header'>
                            <img src="/images/catalex-sign.png" alt="CataLex Sign"/>
                        </Link>

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
