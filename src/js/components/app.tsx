import * as React from "react";
import Header from './header';
import DocumentView from './documentView';
import { CSSTransitionGroup } from 'react-transition-group';


interface AppProps {
    location:  Location,
    children: any
}

export default class App extends React.PureComponent<AppProps, {}> {
    render() {
        const { children, location: { pathname } } = this.props;
        return (
            <div>
                <Header />
                  <CSSTransitionGroup style={{position: 'relative', display:'block'}}
                          transitionName={'slideInRight'}
                          transitionEnterTimeout={400}
                          transitionLeaveTimeout={400}
                        >
                        <div  key={pathname}>
                     {children}
                      </div>
                </CSSTransitionGroup>
            </div>
        );
    }
}