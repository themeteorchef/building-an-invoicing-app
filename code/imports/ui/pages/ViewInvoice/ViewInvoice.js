import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Invoices from '../../../api/Invoices/Invoices';
import Recipients from '../../../api/Recipients/Recipients';
import InvoiceEditor from '../../components/InvoiceEditor/InvoiceEditor';
import StaticInvoice from '../../components/StaticInvoice/StaticInvoice';
import Loading from '../../components/Loading/Loading';

const ViewInvoice = ({ loading, history, context, invoice, recipient }) => (!loading ? (
  <div className="ViewInvoice">
    {invoice && invoice.status === 'draft' ?
      <InvoiceEditor invoice={invoice} history={history} /> :
      <StaticInvoice context={context} invoice={invoice} recipient={recipient} />}
  </div>
) : <Loading />);

ViewInvoice.defaultProps = {
  invoice: null,
};

ViewInvoice.propTypes = {
  history: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  context: PropTypes.string.isRequired,
  invoice: PropTypes.object,
  recipient: PropTypes.object.isRequired,
};

export default createContainer(({ match }) => {
  const invoiceId = match.params._id;
  const subscription = Meteor.subscribe('invoices.view', invoiceId);
  const invoice = Invoices.findOne(invoiceId);

  return {
    loading: !subscription.ready(),
    context: match.path.includes('pay') ? 'pay' : 'view',
    invoice,
    recipient: invoice ? Recipients.findOne({ _id: invoice.recipientId }) : {},
  };
}, ViewInvoice);
