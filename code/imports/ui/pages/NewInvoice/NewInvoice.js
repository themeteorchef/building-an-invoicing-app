import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import InvoiceEditor from '../../components/InvoiceEditor/InvoiceEditor';

const NewInvoice = ({ history }) => (
  <div className="NewInvoice">
    <Row>
      <Col xs={12} sm={10} smOffset={1}>
        <h4 className="page-header">Create a New Invoice</h4>
        <InvoiceEditor history={history} />
      </Col>
    </Row>
  </div>
);

NewInvoice.propTypes = {
  history: PropTypes.object.isRequired,
};

export default NewInvoice;
