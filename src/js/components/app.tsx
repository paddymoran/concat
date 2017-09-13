import * as React from "react";
import { Header, HeaderPublic } from './header';
import { CSSTransitionGroup } from 'react-transition-group';
import Modals from './modals'
import CustomDragLayer from './dragLayer';
import SignIn from './signIn';
import * as moment from 'moment';
import * as momentLocalizer from 'react-widgets/lib/localizers/moment';
import { Col, Row } from 'react-bootstrap';
import StatusBar, { PublicStatusBar } from './statusBar'
import { connect } from 'react-redux';


momentLocalizer(moment);

interface AppProps {
    location:  Location,
    children: any
}

interface LoggedIn {
    loggedIn: boolean
}

function isLoggedIn(state: Sign.State) : LoggedIn {
    return {loggedIn: !!state.user.userId}
}

export  class Container extends React.PureComponent<AppProps> {
    render() {
        const { children, location: { pathname } } = this.props;
        return (
            <div className="container">
                <div  key={pathname} className="main-content">
                    { children }
                </div>
            </div>
        );
    }
}

export  class UnconnectedContainerWithStatusBar extends React.PureComponent<AppProps & LoggedIn> {
    render() {
        const { children, location: { pathname }, loggedIn } = this.props;
        return (
            <div>
                { !loggedIn &&  <PublicStatusBar /> }
                { loggedIn &&  <StatusBar /> }

                <div className="container">
                    <div  key={pathname} className="main-content">
                        { children }
                    </div>
                </div>
            </div>
        );
    }
}

export const ContainerWithStatusBar = connect(isLoggedIn)(UnconnectedContainerWithStatusBar)

export class AppPublic extends React.PureComponent<AppProps> {
    render() {
        return (
            <div>
                <HeaderPublic />
                    <div>
                        {this.props.children}
                    </div>
                <Modals />
            </div>
        );
    }
}

export class AppLoggedIn extends React.PureComponent<AppProps> {
    render() {
        return (
            <div>
                <CustomDragLayer />
                <Header />
                    <div>
                        {this.props.children}
                    </div>
                <Modals />
            </div>
        );
    }
}


export class UnconnectedRequiresLogin extends React.PureComponent<AppProps & LoggedIn>{
    render() {
        if(this.props.loggedIn){
            return this.props.children;
        }
        else{
            return <SignIn />
        }
    }
}


export const RequiresLogin = connect(isLoggedIn)(UnconnectedRequiresLogin)


export class UnconnectedApp extends React.PureComponent<AppProps & LoggedIn> {
    render() {
        if(this.props.loggedIn){
            return <AppLoggedIn {...this.props} />
        }
        else{
            return <AppPublic {...this.props} />
        }
    }
}

export const App = connect(isLoggedIn)(UnconnectedApp);

export default App;
