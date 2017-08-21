import  * as React from "react";
import { connect } from 'react-redux';



export class DateButton extends React.Component<{}> {

    render(){
        return (
            <div className="signature-button" >
                <span className="fa fa-calendar "></span>
                <span>Date</span>
            </div>
        )
    }
}

export class TextButton extends React.Component<{}> {

    render(){
        return (
            <div className="signature-button" >
                <span className="fa fa-font"></span>
                <span>Text</span>
            </div>
        )
    }
}




