'use strict'

import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Button, Icon } from 'react-materialize'

import { PatternLock } from 'asterism-plugin-library'

class SettingsSecurity extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { theme, animationLevel } = this.props
    const waves = animationLevel >= 2 ? 'light' : undefined

    const haveAdminPattern = false // TODO !0
    const haveReadOnlyPattern = false // TODO !0

    return (
      <div className='card'>
        <div className='section left-align'>
          <h5><Icon left>fiber_pin</Icon>Pattern lock</h5>
          <p>
            You should securize interface access with pattern. Admin is able to edit, user cannot.
          </p>
          <p className='row'>
            {!haveAdminPattern && (
              <Button waves={waves} className={cx('activator marged col s12 m5 l7', theme.actions.primary)}>
                <Icon left>enhanced_encryption</Icon>
                <Icon left>verified_user</Icon>
                Set admin pattern
              </Button>
            )}
            {haveAdminPattern && (
              <Button waves={waves} className={cx('activator marged col s12 m5 l7', theme.actions.secondary)}>
                <Icon left>lock</Icon>
                <Icon left>verified_user</Icon>
                Change admin pattern
              </Button>
            )}
            {haveAdminPattern && !haveReadOnlyPattern && (
              <Button waves={waves} className={cx('marged col s12 m5 l7', theme.actions.inconspicious)}>
                <Icon left>lock_open</Icon>
                <Icon left>verified_user</Icon>
                Remove admin pattern
              </Button>
            )}

            {haveAdminPattern && !haveReadOnlyPattern && (
              <Button waves={waves} className={cx('activator marged col s12 m5 l7', theme.actions.primary)}>
                <Icon left>enhanced_encryption</Icon>
                <Icon left>person</Icon>
                Set user pattern
              </Button>
            )}
            {haveAdminPattern && haveReadOnlyPattern && (
              <Button waves={waves} className={cx('activator marged col s12 m5 l7', theme.actions.secondary)}>
                <Icon left>lock</Icon>
                <Icon left>person</Icon>
                Change user pattern
              </Button>
            )}
            {haveAdminPattern && haveReadOnlyPattern && (
              <Button waves={waves} className={cx('marged col s12 m5 l7', theme.actions.inconspicious)}>
                <Icon left>lock_open</Icon>
                <Icon left>person</Icon>
                Remove user pattern
              </Button>
            )}
          </p>
        </div>
        <div className={cx('card-reveal', theme.backgrounds.body)}>
          <span className='card-title'>Draw a pattern<Icon right>close</Icon></span>
          <div className='center-align '>
            <PatternLock theme={theme} animationLevel={animationLevel} />
          </div>
        </div>
      </div>
    )
  }
}

SettingsSecurity.propTypes = {
  theme: PropTypes.object.isRequired,
  itemManager: PropTypes.object.isRequired,
  serverStorage: PropTypes.object.isRequired,
  showRefreshButton: PropTypes.func.isRequired,
  animationLevel: PropTypes.number.isRequired
}

export default SettingsSecurity
