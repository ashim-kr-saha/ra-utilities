import React from 'react';
import { Link } from 'react-admin';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';

const CreateRelatedResourceButton = ({ actionName, record, newResource, fieldsMap, condition }) => {
  var fields = Object.keys(fieldsMap);
  var newRecord = {};
  for(var i = 0; i < fields.length; i++) {
    var field = fields[i];
    newRecord[field] = record[fields[field]];
  }

  return (
    <Button
      component={Link}
      to={{
        pathname: `/${newResource}/create`,
        state: { record: newRecord },
      }}
      disabled={!condition(record)}
    >
      {actionName}
  </Button>
  )
}

CreateRelatedResourceButton.propTypes = {
  actionName: PropTypes.string,
  record: PropTypes.object,
  condition: PropTypes.func,
  fieldsMap: PropTypes.object,
  newResource: PropTypes.string,
};

export default CreateRelatedResourceButton;