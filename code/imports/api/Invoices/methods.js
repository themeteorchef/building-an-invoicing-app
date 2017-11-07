/* eslint-disable max-len */

import Stripe from 'stripe';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Invoices from './Invoices';
import Recipients from '../Recipients/Recipients';
import sendEmail from '../../modules/server/send-email';
import rateLimit from '../../modules/rate-limit';
import { centsToDollars, formatAsCurrency } from '../../modules/currency-conversions';
import generateInvoiceAsPDF from '../../modules/server/generate-invoice-as-pdf';

const stripe = Stripe(Meteor.settings.private.stripe);

const totalLineItems = lineItems =>
  lineItems.reduce((sum, { amount, quantity }) => {
    const itemTotalAmount = amount * quantity;
    return sum + itemTotalAmount;
  }, 0);

const handleSendInvoice = (invoiceId) => {
  try {
    const invoice = Invoices.findOne(invoiceId);
    const owner = Meteor.users.findOne({ _id: invoice.owner }, { fields: { profile: 1, emails: 1 } });
    const ownerName = `${owner.profile.name.first} ${owner.profile.name.last}`;
    const recipient = Recipients.findOne(invoice.recipientId, { fields: { contacts: 1 } });
    const invoiceTotal = formatAsCurrency(centsToDollars(invoice.total));

    generateInvoiceAsPDF({ invoiceId })
      .then(Meteor.bindEnvironment((pdfAsBase64) => {
        if (invoice.status === 'paid') {
          // Sneakily add the invoice owner to the recipient's contacts list so they receive a confirmation, too.
          recipient.contacts.push({
            firstName: owner.profile.name.first,
            lastName: owner.profile.name.last,
            emailAddress: owner.emails[0].address,
          });
        }

        recipient.contacts.forEach(({ firstName, lastName, emailAddress }) => {
          const subject = invoice.status === 'sent' ?
            `[BeagleBone] ${ownerName} has sent you an invoice for ${invoiceTotal}` :
            `[BeagleBone] Payment confirmation for Invoice #${invoice.number}: ${invoice.subject}`;

          sendEmail({
            from: 'BeagleBone <demo@themeteorchef.com>',
            to: `${firstName} ${lastName} <${emailAddress}>`,
            subject,
            template: invoice.status === 'sent' ? 'invoice' : 'invoice-paid',
            templateVars: {
              invoiceNumber: invoice.number,
              firstName,
              senderName: ownerName,
              invoiceTotal,
              invoiceUrl: Meteor.absoluteUrl(`invoices/${invoiceId}/pay`),
            },
            attachments: [{
              filename: `beagle_bone_invoice_${invoiceId}.pdf`,
              content: pdfAsBase64,
              encoding: 'base64',
            }],
          });
        });
      }))
      .catch((error) => {
        throw new Meteor.Error('500', error);
      });
  } catch (exception) {
    console.warn(exception);
  }
};

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

      if (invoice.isSending) {
        // Update here so the correct status (sent) is shown on the PDF.
        Invoices.update(invoiceId, { $set: { status: 'sent' } });
        handleSendInvoice(invoiceId);
      }

      return invoiceId;
    }

    throw new Meteor.Error('500', 'Sorry, you\'re not allowed to update this!');
  },
  'invoices.send': function invoicesSend(invoiceId) {
    check(invoiceId, String);
    handleSendInvoice(invoiceId);
  },
  'invoices.pay': function invoicesPay(options) {
    check(options, Object);
    const { invoiceId, source } = options;
    const invoice = Invoices.findOne(invoiceId);
    stripe.charges.create({
      amount: invoice.total,
      currency: 'usd',
      description: `Payment for Invoice #${invoice.number}: ${invoice.subject}`,
      source,
    }, Meteor.bindEnvironment(() => {
      Invoices.update(invoiceId, { $set: { status: 'paid' } });
      handleSendInvoice(invoiceId);
    }));
  },
});

rateLimit({
  methods: [
    'invoices.insert',
    'invoices.update',
    'invoices.send',
    'invoices.pay',
  ],
  limit: 5,
  timeRange: 1000,
});
