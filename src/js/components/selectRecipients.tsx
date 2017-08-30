import * as React from 'react';
import { Field, FieldArray, reduxForm, FormErrors, BaseFieldProps,  InjectedFormProps, WrappedFieldProps } from 'redux-form'
import { ControlLabel, FormGroup, FormGroupProps, HelpBlock, Col, Row, Button, FormControl } from 'react-bootstrap';
import { connect } from 'react-redux';
import { defineRecipients } from '../actions';
import { push } from 'react-router-redux';

type FormProps = { } & InjectedFormProps

type FieldProps = {
    type: string;
    title?: string;
    placeholder?: string;
} &  WrappedFieldProps

interface RecipientList {
    recipients: Sign.Recipients;
}

const FormInput = (props : FieldProps) => {
    const formProps : FormGroupProps = {};

    if (props.meta.touched) {
        formProps.validationState = (props.meta.valid ? 'success' : 'error');
    }

    return (
        <FormGroup {...formProps}>
            { props.title && <ControlLabel>{ props.title }</ControlLabel> }
            <FormControl type={props.type} {...props.input} placeholder={props.placeholder} />
            <FormControl.Feedback />
            { props.meta.error && props.meta.touched && <HelpBlock>{ props.meta.error }</HelpBlock> }
        </FormGroup>
    );
}

interface RenderRecipientsProps {
    fields: any;
    meta: {
        error: string;
        submitFailed: boolean;
    }
}

class RenderRecipients extends React.PureComponent<RenderRecipientsProps> {
    render() {
        const { fields, meta: { error, submitFailed } } = this.props;

        return (
            <ul>
                {fields.map((recipient: any, index : number) =>
                    <li key={index}>
                        <Row>
                            <Col md={5}>
                                <Field
                                    name={`${recipient}.name`}
                                    type="text"
                                    component={FormInput}
                                    placeholder="Name" />
                            </Col>

                            <Col md={5}>
                                <Field
                                    name={`${recipient}.email`}
                                    type="email"
                                    component={FormInput }
                                    placeholder="Email" />
                            </Col>

                            <Col md={2}>
                                <Button onClick={() => fields.remove(index)}>
                                    <i className="fa fa-trash"/>
                                </Button>
                            </Col>
                        </Row>
                    </li>
                )}

                <li  className="centered-button-row">
                    <div className="btn-toolbar">
                        <Button onClick={() => fields.push({})}>
                            Add Another Recipient
                        </Button>
                    </div>
                </li>

                { submitFailed && error && <div className="alert alert-danger">{error}</div>}
            </ul>
        );
    }
}

class FieldArraysForm extends React.PureComponent<FormProps> {
    render() {
        const { handleSubmit, pristine, reset, submitting, valid } = this.props;

        return (
            <form onSubmit={handleSubmit}>
                <FieldArray name={Sign.FormName.RECIPIENTS} component={RenderRecipients} />
            </form>
        );
    }
}

const validate = (values: Readonly<RecipientList>): FormErrors<RecipientList> => {
    const errors : FormErrors<RecipientList> = {};
    const recipients = values[Sign.FormName.RECIPIENTS];

    const recipientsArrayErrors : FormErrors<Sign.Recipient>[] = [];
    const emails : any = {}
    values.recipients.forEach((recipient : Sign.Recipient, recipientIndex: number) => {
        const recipientErrors = {} as any;
        if (!recipient || !recipient.name) {
            recipientErrors.name = 'Required'
            recipientsArrayErrors[recipientIndex] = recipientErrors
        }
        if (!recipient || !recipient.email) {
            recipientErrors.email = 'Required'
            recipientsArrayErrors[recipientIndex] = recipientErrors
        }
        if (recipient && recipient.email && !recipient.email.match(/[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*/)) {
            recipientErrors.email = 'Please enter a valid email'
            recipientsArrayErrors[recipientIndex] = recipientErrors
        }
        if (recipient && recipient.email && emails[recipient.email]){
            recipientErrors.email = 'Duplicate Email'
            recipientsArrayErrors[recipientIndex] = recipientErrors
        }
        emails[recipient.email] = true;

    })
    if (recipientsArrayErrors.length) {
      errors.recipients = recipientsArrayErrors as any;
    }
    return errors
}


export const InviteForm = reduxForm<RecipientList>({
    form: Sign.FormName.RECIPIENTS, // a unique identifier for this form
    validate
})(FieldArraysForm);

interface SelectRecipientsProps extends Sign.Components.RouteDocumentSet {
    defineRecipients: (values: Sign.Actions.DefineRecipientsPayload) => void;
    push: (url : string) => void;
}


export class SelectRecipients extends React.Component<SelectRecipientsProps>  {
    constructor(props : SelectRecipientsProps){
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
    }
    onSubmit(values: RecipientList) {
        this.props.defineRecipients({documentSetId: this.props.params.documentSetId, recipients: values.recipients});
        this.props.push(`/others_sign/select_annotation/${this.props.params.documentSetId}`);
    }
    render() {
        return (
            <div>
                <div className='page-heading'>
                    <h1 className="title question">Select Recipients</h1>

                    <div className="sub-title step-count">Step 3</div>
                </div>

                <div className="select-recipients">
                    <InviteForm initialValues={{recipients: [{}]}} onSubmit={this.onSubmit} />
                </div>
            </div>
        );
    }
}

const ConnectedSelectRecipients = connect(undefined, {
    defineRecipients, push
})(SelectRecipients);

export default ConnectedSelectRecipients;