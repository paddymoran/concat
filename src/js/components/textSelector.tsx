import  * as React from "react";
import { connect } from 'react-redux';

interface ControlButtonProps {
    active: boolean;
    setActive: () => void;
}

export class DateButton extends React.Component<ControlButtonProps> {

    render(){
        return (
            <div className={`signature-button ${this.props.active ? 'active' : ''}`} onClick={() => this.props.setActive()}>
                <span className="fa fa-calendar "></span>
                <span>Date</span>
            </div>
        )
    }
}

export class TextButton extends React.Component<ControlButtonProps> {

    render(){
        return (
            <div className={`signature-button ${this.props.active ? 'active' : ''}`} onClick={() => this.props.setActive()}>
                <span className="fa fa-font"></span>
                <span>Text</span>
            </div>
        )
    }
}




