import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Recipients from '../../../api/Recipients/Recipients';
import RecipientEditor from '../../components/RecipientEditor/RecipientEditor';
import Loading from '../../components/Loading/Loading';

const EditRecipient = ({ loading, recipient, history }) => (!loading ? (
  <div className="EditRecipient">
    <Row>
      <Col xs={12} sm={6} smOffset={3}>
        <h4 className="page-header">Edit {`"${recipient.name}"`}</h4>
        <RecipientEditor recipient={recipient} history={history} />
      </Col>
    </Row>
  </div>
) : <Loading />);

EditRecipient.propTypes = {
  loading: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  recipient: PropTypes.object.isRequired,
};

export default createContainer(({ match }) => {
  const recipientId = match.params._id;
  const subscription = Meteor.subscribe('recipients.view', recipientId);
  return {
    loading: !subscription.ready(),
    recipient: Recipients.findOne(recipientId),
  };
}, EditRecipient);
