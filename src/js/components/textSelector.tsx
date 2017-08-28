import  * as React from "react";
import { connect } from 'react-redux';

interface ControlButtonProps {
    active: boolean;
    setActive: () => void;
}

export class DateButton extends React.Component<ControlButtonProps> {
    constructor(props: ControlButtonProps) {
        super(props);
        this.setActive = this.setActive.bind(this);
    }
    setActive(e: React.MouseEvent<HTMLElement>){
        e.stopPropagation();
        this.props.setActive();
    }
    render(){
        return <Button label="Date" active={this.props.active} setActive={this.setActive} iconName="calendar" />;
    }
}

export class TextButton extends React.Component<ControlButtonProps> {
    constructor(props: ControlButtonProps) {
        super(props);
        this.setActive = this.setActive.bind(this);
    }
    setActive(e: React.MouseEvent<HTMLElement>){
        e.stopPropagation();
        this.props.setActive();
    }
    render(){
        return <Button label="Custom Text" active={this.props.active} setActive={this.setActive} iconName="font" />;
    }
}

class Button extends React.PureComponent<any> {
    render() {
        return (
            <div className="sign-control">
                <div className={`activate-sign-control ${this.props.active ? 'active' : ''}`} onClick={this.props.setActive}>
                    <i className={`fa fa-${this.props.iconName}`} />
                </div>
            </div>
        );
    }
}