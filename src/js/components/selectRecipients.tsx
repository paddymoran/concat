import * as React from 'react';
import { Field, FieldArray,reduxForm, FormErrors, BaseFieldProps,  InjectedFormProps, WrappedFieldProps, change, touch } from 'redux-form'
import { ControlLabel, FormGroup, FormGroupProps, HelpBlock, Col, Row, Button, FormControl } from 'react-bootstrap';
import { connect } from 'react-redux';
import { defineRecipients, requestContacts } from '../actions';
import { push } from 'react-router-redux';
import { Combobox } from 'react-widgets';

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


interface RecipientRowProps {
    contacts: Sign.Recipients;
    recipient: Sign.Recipient;
    remove: () => void;
}

interface UnconnectedRecipientRowProps extends RecipientRowProps {
    change: (form: string, field: string, value: any) => void;
    touch: (form: string, field: string) => void;
}

class UnconnectedRecipientRow extends React.PureComponent<UnconnectedRecipientRowProps> {
    constructor(props: UnconnectedRecipientRowProps) {
        super(props);
        this.onSelect = this.onSelect.bind(this);
    }

    onSelect(recipient: any) {
        // If the user selected a contact, and that contact has an email, set the email field too
        // We have to check this, because sometimes the input will just be plain text
        if (recipient.email) {
            const fieldName = `${this.props.recipient}.email`;
            this.props.change(Sign.FormName.RECIPIENTS, fieldName, recipient.email);
            this.props.touch(Sign.FormName.RECIPIENTS, fieldName); // touch the field too, for validation
        }
    }

    render() {
        return (
            <li>
                <Row>
                    <Col md={5}>
                        <Field name={`${this.props.recipient}.name`}
                            component={(props: FieldProps) => {
                                return <Combobox {...props.input}   textField="name" data={this.props.contacts}  onSelect={this.onSelect} />
                            }} />

                    </Col>

                    <Col md={5}>
                        <Field
                            name={`${this.props.recipient}.email`}
                            type="email"
                            component={FormInput}
                            placeholder="Email" />
                    </Col>

                    <Col md={2}>
                        <Button onClick={this.props.remove}>
                            <i className="fa fa-trash"/>
                        </Button>
                    </Col>
                </Row>
            </li>
        );
    }
}

const RecipientRow = connect<{}, {}, RecipientRowProps>(null, { change, touch })(UnconnectedRecipientRow);


interface RenderRecipientsProps {
    fields: any;
    meta: {
        error: string;
        submitFailed: boolean;
    }
}

interface UnconnectedRenderRecipientsProps extends RenderRecipientsProps {
    requestContacts: () => void;
    contacts: Sign.Contacts;
}

class UnconnectedRenderRecipients extends React.PureComponent<UnconnectedRenderRecipientsProps> {
    componentDidMount() {
        this.props.requestContacts();
    }

    render() {
        const { fields, meta: { error, submitFailed } } = this.props;

        const contacts = this.props.contacts.status === Sign.DownloadStatus.Complete ? this.props.contacts.contacts : [];

        return (
            <ul>
                {fields.map((recipient: Sign.Recipient, index: number) =>
                    <RecipientRow key={index} recipient={recipient} contacts={contacts} remove={() => fields.remove(index)} />
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

const RenderRecipients = connect(
    (state: Sign.State) => ({
        contacts: state.contacts
    }),
    { requestContacts }
)(UnconnectedRenderRecipients);



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


export class SelectRecipients extends React.PureComponent<SelectRecipientsProps>  {
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