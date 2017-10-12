import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import RecipientEditor from '../../components/RecipientEditor/RecipientEditor';

const NewRecipient = ({ history }) => (
  <div className="NewRecipient">
    <Row>
      <Col xs={12} sm={6} smOffset={3}>
        <h4 className="page-header">New Recipient</h4>
        <RecipientEditor history={history} />
      </Col>
    </Row>
  </div>
);

NewRecipient.propTypes = {
  history: PropTypes.object.isRequired,
};

export default NewRecipient;
