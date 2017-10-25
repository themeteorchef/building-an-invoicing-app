import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Invoices from './Invoices';
import Recipients from '../Recipients/Recipients';
import sendEmail from '../../modules/server/send-email';
import rateLimit from '../../modules/rate-limit';
import { centsToDollars, formatAsCurrency } from '../../modules/currency-conversions';

const totalLineItems = lineItems =>
  lineItems.reduce((sum, { amount, quantity }) => {
    const itemTotalAmount = amount * quantity;
    return sum + itemTotalAmount;
  }, 0)

Meteor.methods({
  'invoices.insert': function invoicesInsert(invoice) {
    check(invoice, Object);
    return Invoices.insert({
      ...invoice,
      status: 'draft',
      owner: this.userId,
      total: totalLineItems(invoice.lineItems),
    });
  },
  'invoices.update': function invoicesUpdate(invoice) {
    check(invoice, Object);
    const invoiceId = invoice._id;
    const isOwner = Invoices.findOne({ _id: invoiceId, owner: this.userId });

    if (isOwner) {
      Invoices.update(invoiceId, { $set: {
        ...invoice,
        total: totalLineItems(invoice.lineItems),
      } });
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
  'invoices.send': function invoicesSend(invoiceId) {
    check(invoiceId, String);
    const invoice = Invoices.findOne(invoiceId);
    const owner = Meteor.users.findOne({ _id: invoice.owner }, { fields: { profile: 1, emails: 1 } });
    const ownerName = `${owner.profile.name.first} ${owner.profile.name.last}`;
    const recipient = Recipients.findOne(invoice.recipientId, { fields: { contacts: 1 } });
    const invoiceTotal = formatAsCurrency(centsToDollars(invoice.total));

    recipient.contacts.forEach(({ firstName, lastName, emailAddress }) => {
      sendEmail({
        from: 'BeagleBone <demo@themeteorchef.com>',
        to: `${firstName} ${lastName} <${emailAddress}>`,
        subject: `[BeagleBone] ${ownerName} has sent you an invoice for ${invoiceTotal}`,
        template: 'invoice',
        templateVars: {
          invoiceNumber: invoice.number,
          firstName,
          senderName: ownerName,
          invoiceTotal,
          invoiceUrl: Meteor.absoluteUrl(`invoices/${invoiceId}/pay`),
        },
      });
    });

    Invoices.update(invoiceId, { $set: { status: 'sent' } });
  },
});

rateLimit({
  methods: [
    'invoices.insert',
    'invoices.update',
    'invoices.remove',
    'invoices.send',
  ],
  limit: 5,
  timeRange: 1000,
});
