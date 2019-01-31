import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { GET_ONE, fetchEnd, fetchStart } from 'ra-core';
import { getFormValues, change } from 'redux-form';
const REDUX_FORM_NAME = 'record-form';

export class ReferenceValueSetter extends Component {
  componentDidMount() {
    this.setValue();
  }

  componentDidUpdate(prevProps) {

    const refId = this.props.formData[this.props.ref_id];

    if (this.lastRefId !== refId) {
      this.lastRefId = refId
      this.setValue(this.props);
    }
  }

  componentWillUnmount() {
    const { source } = this.props;
    change(REDUX_FORM_NAME, source);
  }

  setValue(props = this.props) {
    const {
      source,
      change,
      dataProvider,
      formData
    } = props;

    const reference = this.props.reference;
    const ref_source =  this.props.ref_source;
    const ref_id = formData[this.props.ref_id];
    
    fetchStart();
    if (ref_id) {
      dataProvider(GET_ONE, reference, {id: ref_id})
        .then(json => {
          change(REDUX_FORM_NAME, source, json.data[ref_source]);
        })
        .catch(e => {
          change(REDUX_FORM_NAME, source, undefined);
        })
        .finally(fetchEnd);
    } else {
      change(REDUX_FORM_NAME,source, undefined)
    }
  }

  render() {
    return null;
  }
}

ReferenceValueSetter.propTypes = {
  formData: PropTypes.object.isRequired,
  form: PropTypes.string.isRequired,
  source: PropTypes.string.isRequired,
  reference: PropTypes.string.isRequired,
  ref_source: PropTypes.string.isRequired,
  ref_id: PropTypes.string.isRequired,
  dataProvider: PropTypes.func.isRequired,
  change: PropTypes.func,
};

ReferenceValueSetter.defaultProps = {
  form: REDUX_FORM_NAME,
};

const mapStateToProps = state => ({
  formData: getFormValues(REDUX_FORM_NAME)(state)
});

const mapDispatchToProps = dispatch => {
  return {
    change: (form, field, value) => {
      dispatch(change(form, field, value));
    }
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReferenceValueSetter);
