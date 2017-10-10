import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Invoices from '../Invoices';

Meteor.publish('invoices', function invoices() {
  return Invoices.find({ owner: this.userId });
});

Meteor.publish('invoices.view', function invoicesView(invoiceId) {
  check(invoiceId, String);
  return Invoices.find({ _id: invoiceId, owner: this.userId });
});
