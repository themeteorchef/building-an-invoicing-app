import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Alert } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import RecipientsCollection from '../../../api/Recipients/Recipients';
import Loading from '../../components/Loading/Loading';

import './Recipients.scss';

const Recipients = ({ loading, recipients, match, history }) => (!loading ? (
  <div className="Recipients">
    <div className="page-header clearfix">
      <h4 className="pull-left">Recipients</h4>
      <Link className="btn btn-success pull-right" to={`${match.url}/new`}>New Recipient</Link>
    </div>
    {recipients.length ? <Table hover responsive>
      <thead>
        <tr>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        {recipients.map(({ _id, name }) => (
          <tr key={_id} onClick={() => history.push(`${match.url}/${_id}`)}>
            <td>{name}</td>
          </tr>
        ))}
      </tbody>
    </Table> : <Alert bsStyle="warning">No recipients yet!</Alert>}
  </div>
) : <Loading />);

Recipients.propTypes = {
  loading: PropTypes.bool.isRequired,
  recipients: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('recipients');
  return {
    loading: !subscription.ready(),
    recipients: RecipientsCollection.find().fetch(),
  };
}, Recipients);
