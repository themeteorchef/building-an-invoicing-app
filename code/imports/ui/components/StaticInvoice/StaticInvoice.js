/* eslint-disable max-len */
/* global StripeCheckout */

import React from 'react';
import PropTypes from 'prop-types';
import InlineCSS from 'react-inline-css';
import { monthDayYear } from '@cleverbeagle/dates';
import { Row, Col, ControlLabel, Table, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { centsToDollars, formatAsCurrency } from '../../../modules/currency-conversions';
import loadStripeCheckout from '../../../modules/stripe-checkout';

let checkout;

const handleLoadCheckout = (invoiceId) => {
  loadStripeCheckout(() => {
    checkout = StripeCheckout.configure({
      key: Meteor.settings.public.stripe,
      image: 'https://s3-us-west-2.amazonaws.com/cleverbeagle-assets/graphics/oauth.png',
      locale: 'auto',
      token(token) {
        Meteor.call('invoices.pay', { invoiceId, source: token.id }, (error) => {
          if (error) {
            Bert.alert(error.reason, 'danger');
          } else {
            Bert.alert('Invoice successfully paid! Thanks :)', 'success');
          }
        });
      },
    });
  });
};

const handlePayment = (amount, total) => {
  checkout.open({
    name: 'Beagle Bone Invoices',
    description: `Pay invoice for ${total}`,
    amount,
  });
};

const handleResendInvoice = (invoiceId) => {
  if (confirm('Are you sure? This will resend the invoice immediately.')) {
    Meteor.call('invoices.send', invoiceId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Invoice sent!', 'success');
      }
    });
  }
};

const calculateInvoiceTotal = (lineItems) => {
  let total = 0;
  lineItems.forEach(({ quantity, amount }) => {
    total += (quantity * amount);
  });
  return centsToDollars(total);
};

const StaticInvoice = ({ context, invoice, recipient }) => {
  if (context === 'pay') handleLoadCheckout(invoice._id);
  const formattedInvoiceTotal = invoice ? formatAsCurrency(calculateInvoiceTotal(invoice.lineItems)) : 0;
  return (
    <InlineCSS
      stylesheet={`
        /* ViewInvoice Styles */

        body {
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          font-size: 14px;
          line-height: 1.42857143;
          color: #333;
          background-color: #fff;
        }

        .ViewInvoice .PayInvoice tfoot tr th {
          padding-top: 20px;
        }

        .ViewInvoice .PayInvoice {
          position: relative;
        }

        .ViewInvoice .PayInvoice header {
          margin-bottom: 40px;
        }

        .ViewInvoice .PayInvoice header .header-block {
          margin-bottom: 20px;
        }

        .ViewInvoice .PayInvoice header p {
          margin-bottom: 5px;
        }

        .ViewInvoice .PayInvoice header .mailing-address {
          white-space: pre-line;
          line-height: 22px;
        }

        .ViewInvoice .PayInvoice .Status {
          position: absolute;
          top: 8px;
          right: 10px;
          transform: rotate(5deg);
          font-size: 24px;
          text-transform: uppercase;
          border: 2px dashed #eeeeee;
          padding: 10px 20px;
          border-radius: 3px;
          font-weight: bold;
          display: inline-block;
        }

        .ViewInvoice .PayInvoice .Status.sent {
          color: #777777;
          border-color: #eeeeee;
        }

        .ViewInvoice .PayInvoice .Status.paid {
          color: #5cb85c;
          border-color: #5cb85c;
        }

        .ViewInvoice .PayInvoice .InvoiceNotes {
          padding: 20px;
          margin: 20px 0 40px;
          border-radius: 3px;
          color: #555555;
          background: #eeeeee;
        }

        .ViewInvoice .PayInvoice .InvoiceNotes *:last-child {
          margin-bottom: 0px;
        }

        b,
        strong,
        .control-label {
          font-weight: bold;
        }

        .page-header {
          padding-bottom: 9px;
          margin: 20px 0;
          border-bottom: 1px solid #eee;
        }

        .page-header h4 {
          font-size: 18px;
        }

        table {
          border-collapse: collapse;
          border-spacing: 0;
        }

        thead {
          display: table-header-group;
        }

        .table {
          width: 100%;
          max-width: 100%;
          margin-bottom: 20px;
        }

        .table > thead > tr > th,
        .table > tbody > tr > th,
        .table > tfoot > tr > th,
        .table > thead > tr > td,
        .table > tbody > tr > td,
        .table > tfoot > tr > td {
          padding: 8px;
          line-height: 1.42857143em;
          vertical-align: top;
          border-top: 1px solid #dddddd;
        }

        .table > thead > tr > th:first-child,
        .table > tbody > tr > td:first-child {
          padding-left: 0;
        }

        .table > thead > tr > th {
          vertical-align: bottom;
          border-bottom: 2px solid #dddddd;
        }

        .table > thead:first-child > tr:first-child > th,
        .table > thead:first-child > tr:first-child > td {
          border-top: 0;
        }

        .table > tbody + tbody {
          border-top: 2px solid #dddddd;
        }

        .table .table {
          background-color: #ffffff;
        }

        .table > thead > tr > th.text-left,
        .table > tbody > tr > td.text-left {
          text-align: left !important;
        }

        .table > thead > tr > th.text-center,
        .table > tbody > tr > td.text-center {
          text-align: center !important;
        }

        .table > tfoot > tr > th.text-right {
          text-align: right !important;
        }

        .table > tfoot > tr > th.text-left {
          text-align: left !important;
        }

        @media print {
          html {
            zoom: 0.7;
          }

          .btn,
          .btn-info,
          .btn-success {
            display: none;
          }

          .ViewInvoice .PayInvoice header .control-label {
            margin-bottom: 0px;
          }

          .table {
            border-collapse: collapse !important;
          }

          .table td,
          .table th {
            background-color: #fff !important;
          }
        }
      `}
    >
      <div className="ViewInvoice">
        <Row>
          <Col xs={12} sm={10} smOffset={1}>
            <div className="page-header clearfix">
              <h4 className="pull-left">Invoice #{invoice && invoice.number}</h4>
              {invoice && invoice.status !== 'paid' ? <span>
                {context === 'view' ?
                  <Button onClick={() => handleResendInvoice(invoice._id)} bsStyle="info" className="pull-right">Resend Invoice</Button> :
                  <Button onClick={() => handlePayment(invoice.total, formattedInvoiceTotal)} bsStyle="success" className="pull-right">Pay {formattedInvoiceTotal}</Button>}
              </span> : ''}
            </div>
            <div className="PayInvoice">
              <header>
                <div className={`Status ${invoice.status}`}>
                  {invoice.status}
                </div>
                <Row>
                  <Col xs={12} sm={4}>
                    <div className="header-block">
                      <ControlLabel>Recipient</ControlLabel>
                      <p><em>{recipient.name}</em></p>
                      <p className="mailing-address">{recipient.mailingAddress}</p>
                    </div>
                  </Col>
                  <Col xs={12} sm={3}>
                    <div className="header-block">
                      <ControlLabel>Due Date</ControlLabel>
                      <p>{monthDayYear(invoice.due)}</p>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <div>
                      <ControlLabel>Subject</ControlLabel>
                      <p>{invoice.subject}</p>
                    </div>
                  </Col>
                </Row>
              </header>
              <Table responsive>
                <thead>
                  <tr>
                    <th className="text-left">Description</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-center">Amount</th>
                    <th className="text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map(({ _id, description, quantity, amount }) => (
                    <tr key={_id}>
                      <td>{description}</td>
                      <td className="text-center">{quantity}</td>
                      <td className="text-center">{formatAsCurrency(centsToDollars(amount))}</td>
                      <td>{formatAsCurrency(centsToDollars(quantity * amount))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={2} />
                    <th className="text-right">
                      <strong>Total</strong>
                    </th>
                    <th className="text-left">{formattedInvoiceTotal}</th>
                  </tr>
                </tfoot>
              </Table>
              {invoice.notes ? <div className="InvoiceNotes">
                <ControlLabel>Notes</ControlLabel>
                <p>{invoice.notes}</p>
              </div> : ''}
            </div>
          </Col>
        </Row>
      </div>
    </InlineCSS>
  );
};

StaticInvoice.propTypes = {
  context: PropTypes.string.isRequired,
  invoice: PropTypes.object.isRequired,
  recipient: PropTypes.object.isRequired,
};

export default StaticInvoice;
