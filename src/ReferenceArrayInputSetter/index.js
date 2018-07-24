import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { GET_LIST } from 'ra-core';
import { getFormValues, arrayPush, arrayRemoveAll } from 'redux-form';
import isEqual from 'lodash.isequal';
const REDUX_FORM_NAME = 'record-form';

class ReferenceArrayInputSetter extends Component {
  componentDidMount() {
    this.setArray();
  }

  getSorts(props) {
    if (props.sort instanceof Function) {
      return props.sort(props.formData);
    } else {
      return props.sort;
    }
  }

  getFilters(props) {
    if (props.filter instanceof Function) {
      return props.filter(props.formData);
    } else {
      return props.filter;
    }
  }

  getReference(props) {
    if (props.reference instanceof Function) {
      return props.reference(props.formData);
    } else {
      return props.reference;
    }
  }
  componentDidUpdate(prevProps) {
    const prevReference = this.getReference(prevProps);
    const prevFilter = this.getFilters(prevProps);

    const reference = this.getReference(this.props);
    const filter = this.getFilters(this.props);

    if (prevReference !== reference || !isEqual(prevFilter, filter)) {
      this.setArray(this.props);
    }
  }

  componentWillUnmount() {
    const { source, arrayRemoveAll } = this.props;
    arrayRemoveAll(REDUX_FORM_NAME, source);
  }

  setArray(props = this.props) {
    const {
      perPage,
      formData,
      arrayPush,
      source,
      dataModifier,
      arrayRemoveAll,
      dataProvider
    } = props;

    const reference = this.getReference(this.props);
    const filter = this.getFilters(this.props);
    const sort = this.getSorts(this.props);

    const params = { pagination: { page: 1, perPage }, sort, filter };

    if (reference && filter) {
      dataProvider(GET_LIST, reference, params)
        .then(json => {
          arrayRemoveAll(REDUX_FORM_NAME, source);
          for (var i = 0; i < json.data.length; i++) {
            arrayPush(
              REDUX_FORM_NAME,
              source,
              dataModifier(json.data[i], formData)
            );
          }
        })
        .catch(e => {
          arrayRemoveAll(REDUX_FORM_NAME, source);
        });
    }
  }

  render() {
    return null;
  }
}

ReferenceArrayInputSetter.propTypes = {
  form: PropTypes.string.isRequired,
  filter: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  perPage: PropTypes.number,
  source: PropTypes.string.isRequired,
  sort: PropTypes.oneOfType([
    PropTypes.shape({
      field: PropTypes.string,
      order: PropTypes.oneOf(['ASC', 'DESC'])
    }),
    PropTypes.func
  ]).isRequired,
  reference: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  arrayPush: PropTypes.func,
  dataProvider: PropTypes.func.isRequired,
  dataModifier: PropTypes.func.isRequired
};

ReferenceArrayInputSetter.defaultProps = {
  form: REDUX_FORM_NAME,
  filter: {},
  perPage: 25,
  sort: { field: 'id', order: 'DESC' }
};

const mapStateToProps = state => ({
  formData: getFormValues(REDUX_FORM_NAME)(state)
});

const mapDispatchToProps = dispatch => {
  return {
    arrayPush: (form, field, value) => {
      dispatch(arrayPush(form, field, value));
    },
    arrayRemoveAll: (form, field) => {
      dispatch(arrayRemoveAll(form, field));
    }
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReferenceArrayInputSetter);
