"use strict";
import 'babel-polyfill';

import * as React from "react";
import * as ReactDOM from "react-dom";

import '../style/style.scss';

interface HelloProps { compiler: string; framework: string; }


class Hello extends React.Component<HelloProps, undefined> {
    render() {
        return <h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>;
    }
}

ReactDOM.render(
    <Hello compiler="TypeScript" framework="React" />,
    document.getElementById("example")
);