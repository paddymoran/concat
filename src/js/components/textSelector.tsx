import  * as React from "react";
import { connect } from 'react-redux';



export class DateButton extends React.Component<{}> {

    render(){
        return (
            <div className="signature-button" >
                <span className="fa fa-calendar "></span>
                <span>Add Date</span>
            </div>
        )
    }
}


