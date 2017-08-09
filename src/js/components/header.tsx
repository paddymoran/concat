import * as React from "react";
import { Link } from 'react-router/'
import { Dropdown, MenuItem, Navbar, Nav } from 'react-bootstrap';




export class AccountControls extends React.Component {
    render() {
        //const props = this.props;
        //const close = () => this.refs.dropdown.refs.inner.handleClose()
        const userUrl = 'https://users.catalex.nz';
        return <Dropdown id="account-dropdown" componentClass="li" className="control-icon">
                    <Dropdown.Toggle href={userUrl} onClick={(e) => e.preventDefault()} useAnchor={true}>
                        <span className="fa fa-user-circle"/>
                   </Dropdown.Toggle>
                    <Dropdown.Menu >
                        <MenuItem rel="noopener noreferrer" target="_blank" href={`${userUrl}`}>CataLex Home</MenuItem>
                        { /* <li><Link to={`/account_settings`} onClick={close}>Email Settings</Link></li>
                        <li className="last-login">Last login: {props.userInfo.lastLogin}</li> */ }
                        <li  className="separator" />
                        <MenuItem rel="noopener noreferrer" target="_blank" href='https://browser.catalex.nz'>Law Browser</MenuItem>
                        <MenuItem rel="noopener noreferrer" target="_blank" href='https://workingdays.catalex.nz'>Working Days</MenuItem>
                        <MenuItem rel="noopener noreferrer" target="_blank" href='https://concat.catalex.nz'>ConCat</MenuItem>
                        <li  className="separator" />
                        <MenuItem href='/logout'>Log out</MenuItem>
                    </Dropdown.Menu>
                </Dropdown>

    }
}


export default class Header extends React.Component {
    render() {
        return (<Navbar collapseOnSelect>
               <Navbar.Header>

                        <Link to="/" className='navbar-header'>
                            <img src="/images/catalex-sign-sml.png" alt="CataLex Sign"/>
                        </Link>
                </Navbar.Header>

                        <Nav pullRight>
                               <AccountControls />
                        </Nav>

                </Navbar>
        )
       }
}
