import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Switch from '@material-ui/core/Switch';
import { addField, FieldTitle } from 'ra-core';

const sanitizeRestProps = ({
  alwaysOn,
  basePath,
  component,
  defaultValue,
  formClassName,
  initializeForm,
  input,
  isRequired,
  label,
  locale,
  meta,
  options,
  optionText,
  optionValue,
  record,
  resource,
  allowEmpty,
  source,
  textAlign,
  translate,
  translateChoice,
  ...rest
}) => rest;

export class DynamicLabelBooleanInput extends Component {
  handleChange = (event, value) => {
    this.props.input.onChange(value);
  };

  render() {
    const {
      className,
      input,
      isRequired,
      labelOption,
      source,
      resource,
      options,
      disabled,
      ...rest
    } = this.props;
    const label = labelOption[String(!!input.value)];
    return (
      <FormGroup className={className} {...sanitizeRestProps(rest)}>
        <FormControlLabel
          control={
            <Switch
              color="primary"
              checked={!!input.value}
              onChange={this.handleChange}
              disabled={disabled}
              {...options}
            />
          }
          label={
            <FieldTitle
              label={label}
              source={source}
              resource={resource}
              isRequired={isRequired}
            />
          }
        />
      </FormGroup>
    );
  }
}

DynamicLabelBooleanInput.propTypes = {
  className: PropTypes.string,
  input: PropTypes.object,
  isRequired: PropTypes.bool,
  labelOption: PropTypes.object,
  resource: PropTypes.string,
  source: PropTypes.string,
  options: PropTypes.object,
  disabled: PropTypes.bool
};

DynamicLabelBooleanInput.defaultProps = {
  options: {}
};

export default addField(DynamicLabelBooleanInput);
