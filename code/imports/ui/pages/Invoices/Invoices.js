import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Label, Alert } from 'react-bootstrap';
import { monthDayYear } from '@cleverbeagle/dates';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import InvoicesCollection from '../../../api/Invoices/Invoices';
import Loading from '../../components/Loading/Loading';
import { formatAsCurrency, centsToDollars } from '../../../modules/currency-conversions';

import './Invoices.scss';

const getInvoiceLabel = (status) => {
  const labelClass = {
    draft: 'default',
    sent: 'primary',
    paid: 'success',
    overdue: 'danger',
  }[status];

  return (<Label bsStyle={labelClass}>{status}</Label>);
};

const Invoices = ({ loading, invoices, match, history }) => (!loading ? (
  <div className="Invoices">
    <div className="page-header clearfix">
      <h4 className="pull-left">Invoices</h4>
      <Link className="btn btn-success pull-right" to={`${match.url}/new`}>New Invoice</Link>
    </div>
    {invoices.length ? <Table hover responsive>
      <thead>
        <tr>
          <th />
          <th className="text-center">Status</th>
          <th>Created</th>
          <th>Client/Subject</th>
          <th className="text-center">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map(({ _id, number, status, createdAt, client, subject, total }) => (
          <tr key={_id} onClick={() => history.push(`${match.url}/${_id}`)}>
            <td>#{number}</td>
            <td className="text-center">{getInvoiceLabel(status)}</td>
            <td>{monthDayYear(createdAt)}</td>
            <td>
              <strong>{client}</strong>
              <p>{subject}</p>
            </td>
            <td className="text-center">{formatAsCurrency(centsToDollars(total))}</td>
          </tr>
        ))}
      </tbody>
    </Table> : <Alert bsStyle="warning">No invoices yet!</Alert>}
  </div>
) : <Loading />);

Invoices.propTypes = {
  loading: PropTypes.bool.isRequired,
  invoices: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('invoices');
  return {
    loading: !subscription.ready(),
    invoices: InvoicesCollection.find({}, { sort: { number: -1 } }).fetch(),
  };
}, Invoices);
