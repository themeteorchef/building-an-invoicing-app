import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { Meteor } from 'meteor/meteor';

import 'react-select/dist/react-select.css';

const promisedMethod = method =>
  new Promise((resolve, reject) => {
    Meteor.call(method, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });

const fetchRecipients = () =>
  promisedMethod('recipients.fetch')
    .then(recipients => ({
      options: recipients.map(({ _id, name }) => ({ value: _id, label: name })),
    }));

const SelectRecipient = ({ name, value, onSelect }) => (
  <div className="SelectRecipient">
    <Select.Async
      name={name}
      value={value}
      onChange={onSelect}
      loadOptions={fetchRecipients}
    />
  </div>
);

SelectRecipient.defaultProps = {
  value: null,
};

SelectRecipient.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

export default SelectRecipient;
