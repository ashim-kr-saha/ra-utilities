import React, { Children } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withStyles, createStyles } from '@material-ui/core/styles';

import Link from 'ra-core';
import omit from 'lodash/omit';

function sanitizeRestProps(props) {
  return omit(props, [
    'addLabel',
    'allowEmpty',
    'basePath',
    'cellClassName',
    'className',
    'formClassName',
    'headerClassName',
    'label',
    'linkType',
    'locale',
    'record',
    'resource',
    'sortable',
    'sortBy',
    'source',
    'textAlign',
    'translateChoice',
  ]);
}

const styles = theme =>
  createStyles({
    link: {
      color: theme.palette.primary.main,
    },
  });

const stopPropagation = e => e.stopPropagation();

export const ReferenceLinkField = ({
  allowEmpty,
  basePath,
  children,
  className,
  classes = {},
  record,
  reference,
  source,
  translateChoice = false,
  ...rest
}) => {
  if (React.Children.count(children) !== 1) {
    throw new Error('<ReferenceLinkField> only accepts a single child');
  }
  const referenceRecord = get(record, source);
  var id = "";
  if (referenceRecord.id) {
    id = referenceRecord.id;
  } else {
    id = referenceRecord.uid;
  }

  var resourceLinkPath = `${basePath}/${reference}/${encodeURIComponent(id)}`;

  if (linkType === 'show') {
    resourceLinkPath = `${resourceLinkPath}/show`;
  }

  return (
    <Link
      to={resourceLinkPath}
      className={className}
      onClick={stopPropagation}
    >
      {React.cloneElement(Children.only(children), {
        className: classnames(
          children.props.className,
          classes.link
        ),
        record: referenceRecord,
        resource: reference,
        allowEmpty,
        basePath,
        translateChoice,
        ...sanitizeRestProps(rest),
      })}
    </Link>
  );
};

ReferenceLinkField.propTypes = {
  allowEmpty: PropTypes.bool,
  basePath: PropTypes.string,
  children: PropTypes.element,
  className: PropTypes.string,
  linkType: PropTypes.string,
  classes: PropTypes.object,
  isLoading: PropTypes.bool,
  record: PropTypes.object,
  reference: PropTypes.string,
  source: PropTypes.string,
  translateChoice: PropTypes.bool,
};

const EnhancedReferenceLinkField = withStyles(styles)(ReferenceLinkField);

EnhancedReferenceLinkField.defaultProps = {
  addLabel: true,
  linkType: 'show',
};

EnhancedReferenceLinkField.displayName = 'EnhancedReferenceLinkField';

export default EnhancedReferenceLinkField;