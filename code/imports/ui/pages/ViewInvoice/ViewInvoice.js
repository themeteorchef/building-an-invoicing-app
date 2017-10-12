import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Invoices from '../../../api/Invoices/Invoices';
import InvoiceEditor from '../../components/InvoiceEditor/InvoiceEditor';
import Loading from '../../components/Loading/Loading';

const ViewInvoice = ({ loading, history, invoice }) => (!loading ? (
  <div className="NewInvoice">
    <Row>
      <Col xs={12} sm={10} smOffset={1}>
        <h4 className="page-header">Invoice #{invoice && invoice.number}</h4>
        {invoice && invoice.status === 'draft' ?
          <InvoiceEditor invoice={invoice} history={history} /> :
          <div>
            {JSON.stringify(invoice)}
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
  return {
    loading: !subscription.ready(),
    invoice: Invoices.findOne(invoiceId),
  };
}, ViewInvoice);
