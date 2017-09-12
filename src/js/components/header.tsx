import * as React from "react";
import { Link } from 'react-router';
import { Dropdown, MenuItem, Navbar, Nav, NavItem, NavDropdown} from 'react-bootstrap';

export class AccountControls extends React.PureComponent {
    render() {
        const userUrl = 'https://users.catalex.nz';
        return (
            <Dropdown id="account-dropdown" componentClass="li" className="control-icon">
                <Dropdown.Toggle href={userUrl} onClick={(e) => e.preventDefault()} useAnchor={true}>
                    <span className="fa fa-user-circle"/>
                </Dropdown.Toggle>

                <Dropdown.Menu >
                    <MenuItem rel="noopener noreferrer" target="_blank" href={`${userUrl}`}>CataLex Home</MenuItem>

                    <li className="separator" />

                    <MenuItem rel="noopener noreferrer" target="_blank" href='https://goodcompanies.catalex.nz'>Good Companies</MenuItem>
                    <MenuItem rel="noopener noreferrer" target="_blank" href='https://browser.catalex.nz'>Law Browser</MenuItem>
                    <MenuItem rel="noopener noreferrer" target="_blank" href='https://workingdays.catalex.nz'>Working Days</MenuItem>
                    <MenuItem rel="noopener noreferrer" target="_blank" href='https://concat.catalex.nz'>ConCat</MenuItem>

                    <li className="separator" />

                    <MenuItem href='/logout'>Log out</MenuItem>
                </Dropdown.Menu>
            </Dropdown>
        );

    }
}


export default class Header extends React.PureComponent {
    render() {
        return (
            <Navbar collapseOnSelect>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Navbar.Toggle />
                        <Link to="/" >
                            <img src="/images/catalex-sign-sml.png" alt="CataLex Sign"/>
                        </Link>
                    </Navbar.Brand>
                </Navbar.Header>

                <Navbar.Collapse>
                    <ul className="nav navbar-nav navbar-right">
                        <li ><Link to='/' activeClassName="active">Upload</Link></li>
                        <li><Link to='/all' activeClassName="active">Documents</Link></li>
                        <li><Link to='/verify' activeClassName="active">Verify</Link></li>
                        <AccountControls />
                    </ul>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}
