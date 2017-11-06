import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, FormGroup, ControlLabel, Button, ListGroup, ListGroupItem, Alert } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Bert } from 'meteor/themeteorchef:bert';
import { _ } from 'meteor/underscore';
import validate from '../../../modules/validate';

import './RecipientEditor.scss';

class RecipientEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contacts: (props.recipient && props.recipient.contacts) || [
        { _id: Random.id(), firstName: '', lastName: '', emailAddress: '' },
      ],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const component = this;
    validate(component.form, {
      rules: {
        name: {
          required: true,
        },
      },
      messages: {
        name: {
          required: 'Need a name for this recipient.',
        },
      },
      submitHandler() { component.handleSubmit(); },
    });
  }

  updateContact(event, _id) {
    const contacts = [...this.state.contacts];
    const itemToUpdate = _.findWhere(contacts, { _id });
    itemToUpdate[event.target.name] = event.target.value;
    this.setState({ contacts });
  }

  handleSubmit() {
    const { history } = this.props;
    const existingRecipient = this.props.recipient && this.props.recipient._id;
    const methodToCall = existingRecipient ? 'recipients.update' : 'recipients.insert';
    const recipient = {
      name: this.name.value.trim(),
      mailingAddress: this.mailingAddress.value.trim(),
      contacts: this.state.contacts,
    };

    if (existingRecipient) recipient._id = existingRecipient;

    Meteor.call(methodToCall, recipient, (error, recipientId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = existingRecipient ? 'Recipient updated!' : 'Recipient added!';
        this.form.reset();
        Bert.alert(confirmation, 'success');
        history.push(`/recipients/${recipientId}`);
      }
    });
  }

  render() {
    const { recipient } = this.props;
    return (<div className="RecipientEditor">
      <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <input
            type="text"
            className="form-control"
            name="name"
            ref={name => (this.name = name)}
            defaultValue={recipient && recipient.name}
            placeholder="Shapiro & Smith LLC"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Mailing Address</ControlLabel>
          <textarea
            className="form-control"
            name="mailingAddress"
            ref={mailingAddress => (this.mailingAddress = mailingAddress)}
            defaultValue={recipient && recipient.mailingAddress}
            placeholder={`1234 Fake St.\nExample Town, USA 99887`}
          />
        </FormGroup>
        <FormGroup className="Contacts">
          {this.state.contacts.length > 0 ? <ListGroup>
            {this.state.contacts.map(({ _id, firstName, lastName, emailAddress }) => (
              <ListGroupItem key={_id} className="clearfix">
                <Row>
                  <button
                    className="remove-contact"
                    onClick={(event) => {
                      event.preventDefault();
                      const contacts = [...this.state.contacts].filter(item => item._id !== _id);
                      this.setState({ contacts });
                    }}
                  >
                    <i className="fa fa-remove" />
                  </button>
                  <Col xs={12} sm={3}>
                    <input
                      type="text"
                      name="firstName"
                      className="form-control"
                      value={firstName}
                      placeholder="Luigi"
                      onChange={event => this.updateContact(event, _id)}
                    />
                  </Col>
                  <Col xs={12} sm={3}>
                    <input
                      type="text"
                      name="lastName"
                      className="form-control"
                      value={lastName}
                      placeholder="Mario"
                      onChange={event => this.updateContact(event, _id)}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <input
                      type="text"
                      className="form-control"
                      name="emailAddress"
                      value={emailAddress}
                      placeholder="luigi.mario@mariobros.com"
                      onChange={event => this.updateContact(event, _id)}
                    />
                  </Col>
                </Row>
              </ListGroupItem>
            ))}
          </ListGroup> : <Alert>{'Add at least one recipient.'}</Alert>}
          <Button
            bsStyle="default"
            className="AddContact"
            onClick={() => {
              const contacts = [...this.state.contacts];
              contacts.push({ _id: Random.id(), firstName: '', lastName: '', emailAddress: '' });
              this.setState({ contacts });
            }}
          >
            <i className="fa fa-plus" /> Add Contact
          </Button>
        </FormGroup>
        <Button type="submit" bsStyle="success">
          {recipient && recipient._id ? 'Save Changes' : 'Add Recipient'}
        </Button>
      </form>
    </div>);
  }
}

RecipientEditor.defaultProps = {
  recipient: null,
};

RecipientEditor.propTypes = {
  recipient: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default RecipientEditor;
