import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  ListButton as List,
  ShowButton as Show,
  EditButton as Edit,
  CreateButton as Create,
  ExportButton as Export,
  CardActions,
  WithPermissions
} from 'react-admin';

const CREATE = 'create';
const EDIT = 'edit';
const LIST = 'list';
const SHOW = 'show';
const EXPORT = 'export';

function isVisible(pageType, permission, name, element) {
  var type = '';
  switch (pageType) {
    case LIST:
      type = 'can_see_list';
      break;
    case CREATE:
      type = 'can_create';
      break;
    case EDIT:
      type = 'can_edit';
      break;
    case SHOW:
      type = 'can_see';
      break;
    case EXPORT:
      type = 'can_export';
      break;
    default:
      type = '';
  }
  
  if(permission === undefined || permission === null) {
    return element;
  }
  if(permission[name] === undefined || permission[name] === null) {
    return element;
  }
  if(permission[name][type] === undefined || permission[name][type] === null) {
    return element;
  }
  if(permission[name][type].startsWith('no')) {
    return null;
  } else {
    return element
  }
}

const mapStateToProps = state => {
  return {
    resources: state.admin.resources
  };
};

export class aEditButton extends Component {
  render() {
    const { record, basePath, resource, resources, permissions, ...rest } = this.props;

    if (resources[resource].props.hasEdit) {
      return isVisible(
        EDIT,
        permissions,
        resource,
        <Edit record={record} basePath={basePath} resource={resource} {...rest} />
      );
    } else {
      return null;
    }
  }
}

aEditButton.propTypes = {
  basePath: PropTypes.string,
  record: PropTypes.object,
  resource: PropTypes.string,
  permissions: PropTypes.object
};

export const EditButton = connect(mapStateToProps)(aEditButton);

class aShowButton extends Component {
  render() {
    const { record, basePath, resource, resources, permissions, ...rest } = this.props;

    if (resources[resource].props.hasShow) {
      return isVisible(
        SHOW,
        permissions,
        resource,
        <Show record={record} basePath={basePath} resource={resource} {...rest} />
      );
    } else {
      return null;
    }
  }
}

aShowButton.propTypes = {
  basePath: PropTypes.string,
  record: PropTypes.object,
  resource: PropTypes.string,
  permissions: PropTypes.object
};

export const ShowButton = connect(mapStateToProps)(aShowButton);

class aCreateButton extends Component {
  render() {
    const { record, basePath, resource, resources, permissions, ...rest } = this.props;

    if (resources[resource].props.hasCreate) {
      return isVisible(
        CREATE,
        permissions,
        resource,
        <Create record={record} basePath={basePath} resource={resource} {...rest} />
      );
    } else {
      return null;
    }
  }
}
aCreateButton.propTypes = {
  basePath: PropTypes.string,
  record: PropTypes.object,
  resource: PropTypes.string,
  permissions: PropTypes.object
};

export const CreateButton = connect(mapStateToProps)(aCreateButton);

class aListButton extends Component {
  render() {
    const { record, basePath, resource, resources, permissions, ...rest } = this.props;

    if (resources[resource].props.hasList) {
      return isVisible(
        LIST,
        permissions,
        resource,
        <List record={record} basePath={basePath} resource={resource} {...rest} />
      );
    } else {
      return null;
    }
  }
}
aListButton.propTypes = {
  basePath: PropTypes.string,
  record: PropTypes.object,
  resource: PropTypes.string,
  permissions: PropTypes.object
};

export const ListButton = connect(mapStateToProps)(aListButton);

export class aExportButton extends Component {
  render() {
    const { record, basePath, resource, resources, permissions, ...rest } = this.props;

    if (resources[resource].props.hasList) {
      return isVisible(
        EXPORT,
        permissions,
        resource,
        <Export record={record} basePath={basePath} resource={resource} {...rest} />
      );
    } else {
      return null;
    }
  }
}

aExportButton.propTypes = {
  basePath: PropTypes.string,
  record: PropTypes.object,
  resource: PropTypes.string,
  permissions: PropTypes.object
};

export const ExportButton = connect(mapStateToProps)(aExportButton);

export const ShowActions = ({
  basePath,
  data,
  resource,
  customActions,
  disableList,
  disableEdit
}) => (
  <WithPermissions
    render={({ permissions }) => (
      <CardActions>
        {customActions &&
          React.cloneElement(customActions, {
            record: data,
            permissions,
            resource,
            basePath
          })}
        {!disableEdit && (
          <EditButton
            record={data}
            permissions={permissions}
            basePath={basePath}
            resource={resource}
          />
        )}
        {!disableList && (
          <ListButton
            record={data}
            permissions={permissions}
            basePath={basePath}
            resource={resource}
          />
        )}
      </CardActions>
    )}
  />
);

export const EditActions = ({
  basePath,
  data,
  resource,
  customActions,
  disableShow,
  disableList
}) => (
  <WithPermissions
    render={({ permissions }) => (
      <CardActions>
        {customActions &&
          React.cloneElement(customActions, {
            record: data,
            permissions,
            resource,
            basePath
          })}
        {!disableShow && (
          <ShowButton
            record={data}
            permissions={permissions}
            basePath={basePath}
            resource={resource}
          />
        )}
        {!disableList && (
          <ListButton
            record={data}
            permissions={permissions}
            basePath={basePath}
            resource={resource}
          />
        )}
      </CardActions>
    )}
  />
);

export const ListActions = ({
  basePath,
  currentSort,
  displayedFilters,
  exporter,
  filters,
  filterValues,
  resource,
  disableExport,
  customActions,
  showFilter
}) => (
  <WithPermissions
    render={({ permissions }) => (
      <CardActions>
        {filters &&
          React.cloneElement(filters, {
            resource,
            showFilter,
            displayedFilters,
            filterValues,
            context: 'button'
          })}
        {customActions &&
          React.cloneElement(customActions, {
            resource,
            permissions,
            basePath
          })}
        <CreateButton
          permissions={permissions}
          basePath={basePath}
          resource={resource}
        />
        {!disableExport && (
          <ExportButton
            permissions={permissions}
            resource={resource}
            sort={currentSort}
            filter={filterValues}
            exporter={exporter}
          />
        )}
      </CardActions>
    )}
  />
);
