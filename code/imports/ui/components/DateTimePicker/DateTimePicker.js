import React from 'react';
import Datetime from 'react-datetime';

import 'react-datetime/css/react-datetime.css';

const DateTimePicker = props => (
  <div className="DateTimePicker">
    <Datetime {...props} />
  </div>
);

DateTimePicker.propTypes = {};

export default DateTimePicker;
