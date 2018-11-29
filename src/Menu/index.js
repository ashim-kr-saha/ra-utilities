import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import classnames from 'classnames';
import { getResources, translate } from 'ra-core';
import DefaultIcon from '@material-ui/icons/ViewList';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { DashboardMenuItem, MenuItemLink, Responsive } from 'react-admin';

const DRAWER_WIDTH = 240;

const styles = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: DRAWER_WIDTH
  },
  rootMenu: {
    display: 'flex',
    justifyContent: 'flex-start',
    paddingLeft: '3px',
    width: DRAWER_WIDTH
  },
  rootMenuIcon: {
    paddingLeft: '12px',
    marginRight: '0px'
  }
};

class Menu extends React.Component {
  constructor(props) {
    super(props);
    var state = {};
    var resources = this.props.resources;
    for (var i = 0; i < resources.length; i++) {
      var r = resources[i];
      if (r.hasList) {
        if (r.options && r.options.rootMenuKey) {
          state[r.options.rootMenuKey] = false;
        }
      }
    }
    this.state = state;
  }

  getMenuStructure(resources) {
    var menuList = [];
    var nonSubmenus = [];
    for (var i = 0; i < resources.length; i++) {
      var r = resources[i];
      if (r.hasList) {
        if (r.options && r.options.rootMenuKey) {
          // Having sub-menu
          var found = false;

          var { rootMenuName, rootMenuKey } = r.options;
          for (var j = 0; j < menuList.length; j++) {
            if (menuList[j].rootMenuKey === rootMenuKey) {
              menuList[j].submenus.push(r);
              found = true;
              break;
            }
          }
          if (!found) {
            var submenus = [r];
            menuList.push({
              isRoot: true,
              rootMenuName,
              rootMenuKey,
              submenus
            });
          }
        } else {
          nonSubmenus.push(r);
        }
      } else if (r.options.customUrl) {
        nonSubmenus.push(r);
      }
    }
    var structure = [];
    for (i = 0; i < menuList.length; i++) {
      structure.push(menuList[i]);
    }
    for (i = 0; i < nonSubmenus.length; i++) {
      structure.push(nonSubmenus[i]);
    }
    return structure;
  }

  handleClick(m) {
    var state = this.state;
    state[m] = !state[m];
    this.setState(state);
  }

  getMenus(structure) {
    // console.log(structure);
    const { classes } = this.props;
    var { onMenuClick, dense } = this.props;
    var menu = [];
    for (var i = 0; i < structure.length; i++) {
      var m = structure[i];
      var k = m.rootMenuKey;
      if (m.isRoot) {
        var r = 0;
        let boundHandleClick = this.handleClick.bind(this, k);
        menu.push(
          <ListItem
            key={m.rootMenuKey}
            button
            onClick={boundHandleClick}
            className={classnames(classes.rootMenu)}
          >
            <ListItemIcon className={classnames(classes.rootMenuIcon)}>
              {this.state[m.rootMenuKey] ? <ExpandLess /> : <ExpandMore />}
            </ListItemIcon>
            <ListItemText inset primary={m.rootMenuName} />
          </ListItem>
        );
        menu.push(
          <Collapse
            key={m.rootMenuKey + r++}
            in={this.state[m.rootMenuKey]}
            timeout="auto"
            unmountOnExit
          >
            <List component="nav" disablePadding>
              {m.submenus.map(resource => {
                // var t = translatedResourceName(resource, translate);
                return (
                  <MenuItemLink
                    key={resource.name}
                    to={`/${resource.name}`}
                    primaryText={resource.options.label}
                    leftIcon={
                      resource.icon ? <resource.icon /> : <DefaultIcon />
                    }
                    onClick={onMenuClick}
                    dense={dense}
                  />
                );
              })}
            </List>
          </Collapse>
        );
      } else {
        menu.push(
          <MenuItemLink
            key={m.name}
            to={m.options.customUrl ? `/${m.options.customUrl}` : `/${m.name}`}
            primaryText={m.options.label}
            leftIcon={m.icon ? <m.icon /> : <DefaultIcon />}
            onClick={onMenuClick}
            dense={dense}
          />
        );
      }
    }
    return menu;
  }

  render() {
    const {
      classes,
      className,
      dense,
      hasDashboard,
      onMenuClick,
      pathname,
      resources,
      translate,
      logout,
      ...rest
    } = this.props;
    var menuStructure = this.getMenuStructure(resources);
    var menu = this.getMenus(menuStructure);
    return (
      <div className={classnames(classes.main, className)} {...rest}>
        <List component="nav">
          {hasDashboard && <DashboardMenuItem onClick={onMenuClick} />}
          {menu}
          <Responsive xsmall={logout} medium={null} />
        </List>
      </div>
    );
  }
}

Menu.propTypes = {
  classes: PropTypes.object,
  className: PropTypes.string,
  dense: PropTypes.bool,
  hasDashboard: PropTypes.bool,
  logout: PropTypes.element,
  onMenuClick: PropTypes.func,
  pathname: PropTypes.string,
  resources: PropTypes.array.isRequired,
  translate: PropTypes.func.isRequired
};

Menu.defaultProps = {
  onMenuClick: () => null
};

const mapStateToProps = state => ({
  resources: getResources(state),
  pathname: state.routing.location.pathname // used to force redraw on navigation
});

const enhance = compose(
  translate,
  connect(
    mapStateToProps,
    {}, // Avoid connect passing dispatch in props,
    null,
    {
      areStatePropsEqual: (prev, next) =>
        prev.resources.every(
          (value, index) => value === next.resources[index] // shallow compare resources
        ) && prev.pathname === next.pathname
    }
  ),
  withStyles(styles)
);

export default enhance(Menu);
