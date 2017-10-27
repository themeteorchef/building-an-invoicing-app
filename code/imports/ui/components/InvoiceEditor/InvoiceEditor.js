/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, FormGroup, ControlLabel, Button, ListGroup, ListGroupItem, Panel, Alert } from 'react-bootstrap';
import moment from 'moment';
import CurrencyInput from 'react-currency-input';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';
import SelectRecipient from '../SelectRecipient/SelectRecipient';
import DateTimePicker from '../DateTimePicker/DateTimePicker';
import validate from '../../../modules/validate';
import { currencyToFloat, formatAsCurrency, calculateAndFormatTotal, centsToDollars } from '../../../modules/currency-conversions';

import './InvoiceEditor.scss';

class InvoiceEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = props.invoice ? {
      recipient: props.invoice.recipientId,
      due: moment(props.invoice.due),
      lineItems: props.invoice.lineItems,
    } : {
      recipient: null,
      due: moment(),
      lineItems: [{
        _id: Random.id(),
        description: '',
        quantity: 1,
        amount: 0,
      }],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateLineItem = this.updateLineItem.bind(this);
    this.calculateInvoiceTotal = this.calculateInvoiceTotal.bind(this);
    this.handleSendInvoice = this.handleSendInvoice.bind(this);
  }

  componentDidMount() {
    const component = this;
    validate(component.form, {
      rules: {
        due: {
          required: true,
        },
        subject: {
          required: true,
        },
      },
      messages: {
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

  getAmountAsFloat(amount) {
    // This handles conversion of the String value we get when editing an invoice as well as
    // converting the cents value we store in the DB back to dollars. Both scenarios must be
    // accounted for as we're reusing <InvoiceEditor /> in both creating and editing invoices.
    return typeof amount === 'string' ? currencyToFloat(amount) : centsToDollars(amount);
  }

  updateLineItem(event, _id) {
    const { name, value } = event.target;
    const lineItems = [...this.state.lineItems];
    const itemToUpdate = _.findWhere(lineItems, { _id });
    itemToUpdate[name] = name === 'amount' ? this[`amount_${_id}`].getMaskedValue() : value;
    this.setState({ lineItems });
  }

  calculateInvoiceTotal() {
    let total = 0;
    this.state.lineItems.map(({ quantity, amount }) => (
      total += (quantity * this.getAmountAsFloat(amount))
    ));
    return formatAsCurrency(total);
  }

  handleSendInvoice() {
    if (confirm(`Send this invoice now? We\'ll send it to all of the conctacts of the specified recipient.`)) {
      this.handleSubmit(true); // Pass true to toggle this as isSending.
    }
  }

  handleSubmit(isSending) {
    const { history } = this.props;
    const existingInvoice = this.props.invoice && this.props.invoice._id;
    const methodToCall = existingInvoice ? 'invoices.update' : 'invoices.insert';
    const invoice = {
      recipientId: this.state.recipient,
      due: this.state.due.format(),
      subject: this.subject.value.trim(),
      lineItems: this.state.lineItems.map(({ _id, description, quantity, amount }) => {
        return {
          _id,
          description,
          quantity: parseInt(quantity, 10),
          amount: (this.getAmountAsFloat(amount) * 100),
        };
      }),
      notes: this.notes.value.trim(),
      isSending,
    };

    if (existingInvoice) invoice._id = existingInvoice;

    Meteor.call(methodToCall, invoice, (error, invoiceId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = existingInvoice ? 'Invoice updated!' : 'Invoice created!';
        this.form.reset();
        Bert.alert(isSending ? 'Invoice sent!' : confirmation, 'success');
        history.push(`/invoices/${invoiceId}`);
      }
    });
  }

  render() {
    const { invoice } = this.props;
    return (<div className="InvoiceEditor">
      <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
        <Row>
          <Col xs={12} sm={6}>
            <FormGroup>
              <ControlLabel>Recipient</ControlLabel>
              <SelectRecipient
                name="recipient"
                value={this.state.recipient}
                onSelect={option => this.setState({ recipient: (option && option.value) || null })}
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
          {this.state.lineItems.length > 0 ? <ListGroup className="LineItems">
            {this.state.lineItems.map(({ _id, description, quantity, amount }) => (
              <ListGroupItem key={_id} className="clearfix">
                <Row>
                  <Col xs={12} sm={6}>
                    <button
                      className="remove-line-item"
                      onClick={(event) => {
                        event.preventDefault();
                        const lineItems = [...this.state.lineItems].filter(item => item._id !== _id);
                        this.setState({ lineItems });
                      }}
                    >
                      <i className="fa fa-remove" />
                    </button>
                    <input
                      type="text"
                      name="description"
                      className="form-control"
                      value={description}
                      placeholder="Write GraphQL schema"
                      onChange={event => this.updateLineItem(event, _id)}
                    />
                  </Col>
                  <Col xs={12} sm={2}>
                    <input
                      type="text"
                      className="form-control text-center"
                      name="quantity"
                      value={quantity}
                      onChange={event => this.updateLineItem(event, _id)}
                    />
                  </Col>
                  <Col xs={12} sm={2}>
                    <CurrencyInput
                      type="text"
                      name="amount"
                      className="form-control text-center"
                      ref={amountInput => this[`amount_${_id}`] = amountInput}
                      prefix="$"
                      value={this.getAmountAsFloat(amount)}
                      onChangeEvent={event => this.updateLineItem(event, _id)}
                    />
                  </Col>
                  <Col xs={12} sm={2}>
                    <div className="total">
                      <span>
                        {calculateAndFormatTotal(quantity, this.getAmountAsFloat(amount))}
                      </span>
                    </div>
                  </Col>
                </Row>
              </ListGroupItem>
            ))}
          </ListGroup> : <Alert>{'You need to add at least one line item. Add an item by clicking "Add Item" below.'}</Alert>}
          <Row>
            <Col xs={6}>
              <Button
                bsStyle="default"
                className="AddItem"
                onClick={() => {
                  const lineItems = [...this.state.lineItems];
                  lineItems.push({ _id: Random.id(), description: '', quantity: 1, amount: 0 });
                  this.setState({ lineItems });
                }}
              >
                <i className="fa fa-plus" /> Add Item
              </Button>
            </Col>
            <Col xs={6}>
              <p className="InvoiceTotal">
                <strong>Total</strong>
                <span>{this.calculateInvoiceTotal()}</span>
              </p>
            </Col>
          </Row>
        </FormGroup>
        <FormGroup className="InvoiceNotes">
          <Panel>
            <ControlLabel>Notes (optional, displayed on invoice)</ControlLabel>
            <textarea
              name="notes"
              className="form-control"
              defaultValue={invoice && invoice.notes}
              ref={notes => (this.notes = notes)}
            />
          </Panel>
        </FormGroup>
        <Button disabled={this.state.lineItems.length === 0} type="submit" bsStyle="success">
          {invoice && invoice._id ? 'Save Changes' : 'Create Invoice'}
        </Button>
        {invoice && invoice._id ? <Button disabled={this.state.lineItems.length === 0} onClick={this.handleSendInvoice} bsStyle="primary">
          Send Invoice
        </Button> : ''}
      </form>
    </div>);
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
