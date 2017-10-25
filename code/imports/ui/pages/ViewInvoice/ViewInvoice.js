import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, ControlLabel, Table } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { monthDayYear } from '@cleverbeagle/dates';
import Invoices from '../../../api/Invoices/Invoices';
import Recipients from '../../../api/Recipients/Recipients';
import InvoiceEditor from '../../components/InvoiceEditor/InvoiceEditor';
import Loading from '../../components/Loading/Loading';
import { centsToDollars, formatAsCurrency } from '../../../modules/currency-conversions';

import './ViewInvoice.scss';

const calculateInvoiceTotal = (lineItems) => {
  let total = 0;
  lineItems.forEach(({ quantity, amount }) => {
    total += (quantity * amount);
  });
  return centsToDollars(total);
};

const ViewInvoice = ({ loading, history, invoice, recipient }) => (!loading ? (
  <div className="ViewInvoice">
    <Row>
      <Col xs={12} sm={10} smOffset={1}>
        <h4 className="page-header">Invoice #{invoice && invoice.number}</h4>
        {invoice && invoice.status === 'draft' ?
          <InvoiceEditor invoice={invoice} history={history} /> :
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
                  <th>Description</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-center">Amount</th>
                  <th>Total</th>
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
                  <th>{formatAsCurrency(calculateInvoiceTotal(invoice.lineItems))}</th>
                </tr>
              </tfoot>
            </Table>
          </div>}
      </Col>
    </Row>
  </div>
) : <Loading />);

ViewInvoice.defaultProps = {
  invoice: null,
};

ViewInvoice.propTypes = {
  history: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  invoice: PropTypes.object,
};

export default createContainer(({ match }) => {
  const invoiceId = match.params._id;
  const subscription = Meteor.subscribe('invoices.view', invoiceId);
  const invoice = Invoices.findOne(invoiceId);

  return {
    loading: !subscription.ready(),
    invoice: Invoices.findOne(invoiceId),
    recipient: invoice ? Recipients.findOne({ _id: invoice.recipientId }) : {},
  };
}, ViewInvoice);
