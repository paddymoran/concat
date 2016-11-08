import * as React from "react";


export default class Header extends React.Component<{}, {}> {
    render(){
        return <div className="header">
        <nav className="navbar navbar-default">
        <div className="logo">
            <img src="/images/catalex-sign.png" alt="CataLex Sign"/>
        </div>


        </nav>
        </div>
       }
}
