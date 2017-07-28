import * as React from "react";
import Header from './header';
import DocumentView from './documentView';
import DragContextDocumentHandler from './dragContextDocumentHandler';
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
                          transitionName={'fadeIn'}
                          transitionEnterTimeout={400}
                          transitionLeaveTimeout={400}
                        >
                        <div style={{position: 'absolute', width: '100%'}} key={pathname}>
                     {children}
                      </div>
                </CSSTransitionGroup>
            </div>
        );
    }
}