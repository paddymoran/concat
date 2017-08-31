import  * as React from "react";
import { connect } from 'react-redux';

interface ControlButtonProps {
    active: boolean;
    setActive: () => void;
}

export class DateButton extends React.PureComponent<ControlButtonProps> {
    constructor(props: ControlButtonProps) {
        super(props);
        this.setActive = this.setActive.bind(this);
    }
    setActive(e: React.MouseEvent<HTMLElement>){
        e.stopPropagation();
        this.props.setActive();
    }
    render(){
        return <ControlButton label="Date" active={this.props.active} setActive={this.setActive} iconName="calendar" />;
    }
}

export class TextButton extends React.PureComponent<ControlButtonProps> {
    constructor(props: ControlButtonProps) {
        super(props);
        this.setActive = this.setActive.bind(this);
    }
    setActive(e: React.MouseEvent<HTMLElement>){
        e.stopPropagation();
        this.props.setActive();
    }
    render(){
        return <ControlButton label="Custom Text" active={this.props.active} setActive={this.setActive} iconName="font" />;
    }
}

export class PromptButton extends React.PureComponent<ControlButtonProps> {
    constructor(props: ControlButtonProps) {
        super(props);
        this.setActive = this.setActive.bind(this);
    }
    setActive(e: React.MouseEvent<HTMLElement>){
        e.stopPropagation();
        this.props.setActive();
    }
    render(){
        return <ControlButton label="Request Signature" showLabel={true} active={this.props.active} setActive={this.setActive} iconName="paste" />;
    }
}


class ControlButton extends React.PureComponent<any> {
    render() {
        return (
            <div className="sign-control">
                <div className={`activate-sign-control ${this.props.active ? 'active' : ''}`} onClick={this.props.setActive}>
                <div className="button-text"><i className={`fa fa-${this.props.iconName}`} /> { this.props.showLabel && this.props.label }</div>
                </div>
            </div>
        );
    }
}