/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, FormGroup, ControlLabel, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { Random } from 'meteor/random';
import SelectRecipient from '../SelectRecipient/SelectRecipient';
import DateTimePicker from '../DateTimePicker/DateTimePicker';
import validate from '../../../modules/validate';

class InvoiceEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = props.invoice ? {
      recipientId: props.invoice.recipientId,
      due: props.invoice.due,
      lineItems: props.invoice.lineItems,
    } : {
      recipientId: null,
      due: moment(),
      lineItems: [{
        _id: Random.id(),
        description: '',
        quantity: 0,
        amount: 0,
      }],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const component = this;
    validate(component.form, {
      rules: {
        recipient: {
          required: true,
        },
        due: {
          required: true,
        },
        subject: {
          required: true,
        },
      },
      messages: {
        recipient: {
          required: 'Who are we sending this to?',
        },
        due: {
          required: 'When is this due?',
        },
        subject: {
          required: 'What is this invoice for?',
        },
      },
      submitHandler() { component.handleSubmit(); },
    });
  }

  handleSubmit() {
    const { history } = this.props;
    const existingInvoice = this.props.invoice && this.props.invoice._id;
    const methodToCall = existingInvoice ? 'invoices.update' : 'invoices.insert';
    const invoice = {
      recipientId: this.recipient.value,
      due: this.due.value,
      subject: this.subject.value.trim(),
      lineItems: this.state.lineItems,
      notes: this.notes.value.trim(),
    };

    if (existingInvoice) invoice._id = existingInvoice;

    Meteor.call(methodToCall, invoice, (error, invoiceId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = existingInvoice ? 'Invoice updated!' : 'Invoice created!';
        this.form.reset();
        Bert.alert(confirmation, 'success');
        history.push(`/invoices/${invoiceId}`);
      }
    });
  }

  render() {
    const { invoice } = this.props;
    return (<form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
      <Row>
        <Col xs={12} sm={6}>
          <FormGroup>
            <ControlLabel>Recipient</ControlLabel>
            <SelectRecipient
              value={this.state.recipientId}
              onSelect={value => this.setState({ recipientId: value })}
            />
          </FormGroup>
        </Col>
        <Col xs={12} sm={6}>
          <FormGroup>
            <ControlLabel>Due Date</ControlLabel>
            <DateTimePicker
              value={this.state.due}
              dateFormat="MMMM Do, YYYY"
              timeFormat={false}
              inputProps={{ name: 'due' }}
              onChange={due => this.setState({ due })}
            />
          </FormGroup>
        </Col>
      </Row>
      <FormGroup>
        <ControlLabel>Subject</ControlLabel>
        <input
          type="text"
          className="form-control"
          name="subject"
          ref={subject => (this.subject = subject)}
          defaultValue={invoice && invoice.subject}
          placeholder="Wiring up MySQL database with GraphQL server"
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Line Items</ControlLabel>
        <ListGroup>
          {this.state.lineItems.map(({ _id, description, quantity, amount }) => (
            <ListGroupItem key={_id}>
              <Row>
                <Col xs={12} sm={6}>
                  <input
                    type="text"
                    className="form-control"
                    value={description}
                    placeholder="Write GraphQL schema"
                  />
                </Col>
                <Col xs={12} sm={2}>
                  <input
                    type="text"
                    className="form-control"
                    value="0"
                  />
                </Col>
                <Col xs={12} sm={2}>
                  <input
                    type="text"
                    className="form-control"
                    value="0"
                  />
                </Col>
                <Col xs={12} sm={2}>
                  {quantity * amount}
                </Col>
              </Row>
            </ListGroupItem>
          ))}
        </ListGroup>
      </FormGroup>
      <Button type="submit" bsStyle="success">
        {invoice && invoice._id ? 'Save Changes' : 'Create Invoice'}
      </Button>
    </form>);
  }
}

InvoiceEditor.defaultProps = {
  invoice: null,
};

InvoiceEditor.propTypes = {
  invoice: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default InvoiceEditor;
