import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Invoices from './Invoices';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'invoices.insert': function invoicesInsert(invoice) {
    check(invoice, Object);
    return Invoices.insert({
      ...invoice,
      status: 'draft',
      owner: this.userId,
      total: invoice.lineItems.reduce((sum, item) => (sum + item.amount), 0),
    });
  },
  'invoices.update': function invoicesUpdate(invoice) {
    check(invoice, Object);
    const invoiceId = invoice._id;
    const isOwner = Invoices.findOne({ _id: invoiceId, owner: this.userId });

    if (isOwner) {
      Invoices.update(invoiceId, { $set: invoice });
      return invoiceId;
    }

    throw new Meteor.Error('500', 'Sorry, you\'re not allowed to update this!');
  },
  'invoices.remove': function invoicesRemove(invoiceId) {
    check(invoiceId, String);
    const isOwner = Invoices.findOne({ _id: invoiceId, owner: this.userId });

    if (isOwner) return Invoices.remove(invoiceId);
    throw new Meteor.Error('500', 'Sorry, you\'re not allowed to delete this!');
  },
});

rateLimit({
  methods: [
    'invoices.insert',
    'invoices.update',
    'invoices.remove',
  ],
  limit: 5,
  timeRange: 1000,
});
