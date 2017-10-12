import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Invoices = new Mongo.Collection('Invoices');

Invoices.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Invoices.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

const InvoicesSchema = new SimpleSchema({
  createdAt: {
    type: String,
    label: 'The date this invoice was created.',
    autoValue() {
      if (this.isInsert) return (new Date()).toISOString();
      return this.value;
    },
  },
  sentAt: {
    type: String,
    label: 'The date this invoice was sent.',
    optional: true,
  },
  paidAt: {
    type: String,
    label: 'The date this invoice was paid at.',
    optional: true,
  },
  status: {
    type: String,
    allowedValues: ['draft', 'sent', 'paid'],
    label: 'The current status of this invoice.',
  },
  owner: {
    type: String,
    label: 'The userId that owns this invoice.',
  },
  number: {
    type: String,
    label: 'The number of this invoice.',
    autoValue() {
      if (this.isInsert) return (Invoices.find({ owner: this.userId }).count() + 1).toString();
      return this.value;
    },
  },
  recipientId: {
    type: String,
    label: 'The ID of the recipient in the recipients collection.',
  },
  recipient: {
    type: Object,
    label: 'The invoice recipient\'s details at the time of sending.',
    optional: true,
  },
  'recipient.name': {
    type: String,
    label: 'The recipient\'s name.',
  },
  'recipient.mailingAddress': {
    type: String,
    label: 'The recipient\'s mailing address.',
  },
  'recipient.contact': {
    type: Object,
    label: 'The contact the invoice was sent to.',
  },
  'recipient.contact.name': {
    type: String,
    label: 'The full name of the contact.',
  },
  'recipient.contact.emailAddress': {
    type: String,
    label: 'The email address of the contact.',
  },
  due: {
    type: String,
    label: 'The date this invoice is due.',
  },
  subject: {
    type: String,
    label: 'What is this invoice for?',
  },
  lineItems: {
    type: Array,
    label: 'The line items for this invoice.',
    defaultValue: [],
  },
  'lineItems.$': {
    type: Object,
    label: 'A line item for this invoice.',
  },
  'lineItems.$._id': {
    type: String,
    label: 'The unique ID for this line item.',
  },
  'lineItems.$.description': {
    type: String,
    label: 'The description for this line item.',
  },
  'lineItems.$.quantity': {
    type: Number,
    label: 'The quantity for this line item.',
  },
  'lineItems.$.amount': {
    type: Number,
    label: 'The amount for this line item in cents.',
  },
  total: {
    type: Number,
    label: 'The total price of the invoice when it was sent in cents.',
    optional: true,
  },
  notes: {
    type: String,
    label: 'Notes about this invoice.',
    optional: true,
  },
});

Invoices.attachSchema(InvoicesSchema);

export default Invoices;
