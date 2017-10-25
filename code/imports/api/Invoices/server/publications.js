import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Invoices from '../Invoices';
import Recipients from '../../Recipients/Recipients';

Meteor.publish('invoices', function invoices() {
  return Invoices.find({ owner: this.userId }, { sort: { createdAt: -1 } });
});

Meteor.publish('invoices.view', function invoicesView(invoiceId) {
  check(invoiceId, String);
  const invoice = Invoices.findOne({ _id: invoiceId });
  return invoice.status !== 'draft' ? [
    Invoices.find({ _id: invoiceId }),
    Recipients.find({ _id: invoice.recipientId }),
  ] :
    Invoices.find({ _id: invoiceId, owner: this.userId });
});
