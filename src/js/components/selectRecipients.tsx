import * as React from 'react';
import { Field, GenericField, FieldArray, reduxForm } from 'redux-form'
import * as FormControl from 'react-bootstrap/lib/FormControl'
import { ControlLabel, FormGroup } from 'react-bootstrap';
import * as Button from 'react-bootstrap/lib/Button'


const MyField = Field as new () => GenericField<any>;

const FormInput = (props : any) => {
    const validationState = props.meta.valid ? 'success' : 'error';
    return <FormGroup validationState={validationState} >
        <ControlLabel>{ props.label }</ControlLabel>
         <FormControl type={props.type} {...props.input}  />
         <FormControl.Feedback />
         </FormGroup>
}


const renderRecipients = (props: any) => {
    const { fields, meta: { error, submitFailed } } = props;
    return (
  <ul>
    {fields.map((recipient: any, index : number) =>
      <li key={index}>
        <Button
          onClick={() => fields.remove(index)}
          ><i className="fa fa-trash"/></Button>
        <h4>
          Recipient #{index + 1}
        </h4>
        <MyField
          name={`${recipient}.name`}
          type="text"
          component={FormInput}
          label="Name"
        />
        <MyField
          name={`${recipient}.email`}
          type="email"
          component={FormInput }
          label="Email"
        />
      </li>
    )}
    <li>
      <Button onClick={() => fields.push({})}>
        Add Recipient
      </Button>
      {submitFailed &&
        error &&
        <span>
          {error}
        </span>}
    </li>
  </ul>)
}

const FieldArraysForm = props => {
  const { handleSubmit, pristine, reset, submitting } = props
  return (
    <form onSubmit={handleSubmit}>

      <FieldArray name="recipients" component={renderRecipients} />
      <div>
        <Button type="submit" disabled={submitting}>
          Submit
        </Button>
        <Button disabled={pristine || submitting} onClick={reset}>
          Clear Values
        </Button>
      </div>
    </form>
  )
}


const validate = (values : Sign.Recipients) => {
    const errors = {} as any;
    if (!values.recipients || !values.recipients.length) {
        errors.recipients = { _error: 'At least one recipient must be entered' }
    }
    const recipientsArrayErrors = [] as any[];
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
    })
    if (recipientsArrayErrors.length) {
      errors.recipients = recipientsArrayErrors
    }
    return errors
}


const Form = reduxForm({
  form: 'selectRecipients', // a unique identifier for this form
 validate
})(FieldArraysForm)


export default class SelectRecipients extends React.Component<any>  {
    render() {
        return (<div className="container">
                <div className='page-heading'>
                <h1 className="title question">Select Recipients</h1>
                <div className="sub-title step-count">Step 3</div>
                </div>
            <div className="select-recipients">
            <Form initialValues={{recipients: [{}]}}/>
            </div>
            </div>
        );
    }
}
