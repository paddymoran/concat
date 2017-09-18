import * as React from 'react';
import Joyride from 'react-joyride';
import { connect } from 'react-redux';
import { changeTour, updateUserMeta } from '../actions';

const arrayOfSteps = [
  {
        name: "WELCOME",
        title: 'Welcome to CataLex Sign',
        text: 'This is the signing view.  The control bar highlighted above allows you to add signatures, text, and signature requests.',
        selector: '.controls',
        style: {
          mainColor: '#a6171d',
        },
      },
      {
        name: "SIGNATURE",
        title: 'Signature Button',
        text: 'This is the signature button.  Clicking will allow you to draw or upload an image of your signature, which you can then add to your document.',
        selector: '.sign-control.signature-control',
        style: {
          mainColor: '#a6171d',
        },
      },
      {
        name: "INITIAL",
        title: 'Initial Button',
        text: 'This is the initial button.  It functions just like the signature button but for initials.',
        selector: '.sign-control.initial-control',
        style: {
          mainColor: '#a6171d',
        },
      },
      {
        name: "DATE",
        title: 'Date Button',
        text: 'This is the date button.  Drag it onto the document to place a date.',
        selector: '.sign-control.date-control',
        style: {
          mainColor: '#a6171d',
        },
    },
      {
        name: "TEXT",
        title: 'Text Button',
        text: 'This is the text box button.  Drag it onto the document to add custom text.',
        selector: '.sign-control.text-control',
        style: {
          mainColor: '#a6171d',
        },
      },
      {
        name: "PROMPT",
        title: 'Request Signature Button',
        text: 'This is the request signature button.  You can use it to invite other people to sign, initial, or date your document.  Place the prompt on the document where you would like a recipient to sign.',
        selector: '.sign-control.prompt-control',
        style: {
          mainColor: '#a6171d',
        },
    },
      {
        name: "SAVE",
        title: 'Save Draft Button',
        text: 'If you have a large set of documents to prepare, you may wish click this to ocassionally save your work.  You can find your saved drafts in the Document page, under Pending.',
        selector: '.sign-control.save-control',
        style: {
          mainColor: '#a6171d',
        },
    },
      {
        name: "INVITE",
        title: 'Invite Button',
        text: 'Click this to modify the list of recipients.  These recipients will be emailed a link to sign your document.',
        selector: '.sign-control.invite-control',
        style: {
          mainColor: '#a6171d',
        },
    },
      {
        name: "REJECT",
        title: 'Reject Button',
        text: 'If you do not wish to sign the document, click this button.  The sender will be informed of your rejection, along with an optional message that you can add.',
        selector: '.sign-control.reject-control',
        style: {
          mainColor: '#a6171d',
        },
    },
      {
        name: "GUIDE",
        title: 'Guide Button',
        text: 'Click this button will scroll you to the next prompt you have been asked to fill out.',
        selector: '.sign-control.guide-button',
        style: {
          mainColor: '#a6171d',
        },
    },
      {
        name: "SIGN",
        title: 'Sign Button',
        text: 'When you are finished with your document, click this button.  A prompt will guide you through the final steps.',
        selector: '.sign-control.submit-button',
        style: {
          mainColor: '#a6171d',
        },
    },
];


interface TourProps {
    showing: boolean;
    userMeta: Sign.UserMetaData;
    changeTour: (payload : Sign.Actions.ChangeTourPayload) => void;
    updateUserMeta: (payload: Sign.Actions.UpdateUserMetaDataPayload) => void;
}

function getNextStepIndex(tour: any[], seen: string[]){
    return tour.findIndex((t:any) => {
        return seen.indexOf(t.name) === -1
    });
}


class Tour extends React.PureComponent<TourProps,  {stepIndex: number, steps: any[]}>{


    constructor(props: TourProps){
        super(props);
        this.callback = this.callback.bind(this);
        this.state = {stepIndex: 0, steps: arrayOfSteps}
    }


    componentWillReceiveProps(newProps: TourProps) {
        if(this.props.showing === false && newProps.showing === true){
            this.setState({stepIndex: 0})
        }
    }

    callback(data: any) {
        const tourViewed = this.props.userMeta.tour.tourViewed || [];
        if ((data.action === 'close' && data.type === 'step:after') || (data.action === 'skip')) {
              this.props.changeTour({showing: false})  ;
              this.props.updateUserMeta({
                 tour: {
                     tourViewed: [...tourViewed],
                     tourDismissed: true
                 }
              });
        }
        if(data.action === "next" || data.action === 'start'){
          // force progress to next
            if(data.type === 'step:after'){
                this.props.updateUserMeta({
                    tour: {
                        tourViewed: [...tourViewed, this.state.steps[data.index].name],
                        tourDismissed: false
                    }
                });
                 // get 'next index, based on what has been skipped'
                this.setState({stepIndex: data.index})
            }
            if(data.type === "error:target_not_found"){
              if(data.index + 1 < this.state.steps.length){
                  this.setState({stepIndex: data.index+1})
              }
            }
            else if(data.type === 'finished'){
                this.props.changeTour({showing: false})
            }
        }
    }

    render() {
        console.log(this.state.stepIndex)
        return <div>
            { this.props.showing && !!this.state.steps.length && <Joyride
            ref="joyride"
            stepIndex={this.state.stepIndex}
            steps={this.state.steps}
            run={this.props.showing}
            autoStart={this.props.showing}
            callback={this.callback}
            disableOverlay={true}
            showSkipButton={true}
            type='continuous'
            debug={true}
            locale={{ back: 'Back', close: 'Close', last: 'Done', next: 'Next', skip: 'Skip' }}
            /> }
            { this.props.children }
        </div>
    }
}

export const  SignTour = connect(
    (state: Sign.State, ownProps) => {
        return {showing: state.tour.showing, userMeta: state.userMeta}
    }, {
        changeTour, updateUserMeta
    }
)(Tour);
