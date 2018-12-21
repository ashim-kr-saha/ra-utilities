import React from 'react';
import { Link } from 'react-admin';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';

/**
 * fieldsMap = {
 *    purchase_id: id,
 *    items: items,
 *    purchase_invoice_no: invoice_no
 * }
 * @param {fieldsMap} fieldsMap
 */

const CreateRelatedResourceButton = ({ actionName, record, newResource, fieldsMap, condition, isVisible, conditionChecker }) => {
  var fields = Object.keys(fieldsMap);
  var newRecord = {};
  for(var i = 0; i < fields.length; i++) {
    var field = fields[i];
    newRecord[field] = record[fields[field]];
  }

  var disabled = true;
  if(condition instanceof Object) {
    var keys = Object.keys(condition);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      disabled = disabled && (record[key] === condition[key]);
    }
  }

  if(conditionChecker instanceof Function) {
    disabled = disabled && conditionChecker(record)
  }

  var visible = true;
  if(isVisible instanceof Function) {
    visible = isVisible(record)
  }
  
  if(visible) {
    return (
      <Button
        component={Link}
        to={{
          pathname: `/${newResource}/create`,
          state: { record: newRecord },
        }}
        disabled={disabled}
      >
        {actionName}
      </Button>
    )
  } else {
    return null;
  }
}

CreateRelatedResourceButton.propTypes = {
  actionName: PropTypes.string,
  record: PropTypes.object,
  visible: PropTypes.func,
  condition: PropTypes.func,
  fieldsMap: PropTypes.object,
  newResource: PropTypes.string,
};

export default CreateRelatedResourceButton;