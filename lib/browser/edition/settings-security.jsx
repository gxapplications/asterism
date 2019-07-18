'use strict'

/* global $ */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Button, Icon } from 'react-materialize'

import { PatternLock } from 'asterism-plugin-library'

class SettingsSecurity extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      adminPatternExists: false,
      readOnlyPatternExists: false,
      currentPatternKey: null
    }
  }

  componentDidMount () {
    return Promise.all([
      this.props.serverStorage.getItem('security-admin').catch(() => false),
      this.props.serverStorage.getItem('security-readOnly').catch(() => false)
    ])
    .then(([adminPattern, readOnlyPattern]) => {
      this.setState({ adminPatternExists: !!adminPattern, readOnlyPatternExists: !!readOnlyPattern })
    })
  }

  shouldComponentUpdate (nextProps, nextState) {
    const comparator = (i) => [
      i.adminPatternExists,
      i.readOnlyPatternExists,
      i.currentPatternKey
    ]
    return JSON.stringify(comparator(this.state)) !== JSON.stringify(comparator(nextState))
  }

  render () {
    const { theme, animationLevel } = this.props
    const waves = animationLevel >= 2 ? 'light' : undefined

    const { adminPatternExists, readOnlyPatternExists } = this.state

    return (
      <div className='card'>
        <div className='section left-align'>
          <h5><Icon left>fiber_pin</Icon>Pattern lock</h5>
          <p>
            You should secure interface access with pattern. Admin is able to edit, user cannot.
          </p>
          <p className='row'>
            {!adminPatternExists && (
              <Button waves={waves} className={cx('activator marged col s12 m5 l7', theme.actions.primary)} onClick={this.setCurrentPatternKey.bind(this, 'admin')}>
                <Icon left>enhanced_encryption</Icon>
                <Icon left>verified_user</Icon>
                Set admin pattern
              </Button>
            )}
            {adminPatternExists && (
              <Button waves={waves} className={cx('activator marged col s12 m5 l7', theme.actions.secondary)} onClick={this.setCurrentPatternKey.bind(this, 'admin')}>
                <Icon left>lock</Icon>
                <Icon left>verified_user</Icon>
                Change admin pattern
              </Button>
            )}
            {adminPatternExists && !readOnlyPatternExists && (
              <Button waves={waves} className={cx('marged col s12 m5 l7', theme.actions.inconspicious)} onClick={this.removePattern.bind(this, 'admin')}>
                <Icon left>lock_open</Icon>
                <Icon left>verified_user</Icon>
                Remove admin pattern
              </Button>
            )}

            {adminPatternExists && !readOnlyPatternExists && (
              <Button waves={waves} className={cx('activator marged col s12 m5 l7', theme.actions.primary)} onClick={this.setCurrentPatternKey.bind(this, 'readOnly')}>
                <Icon left>enhanced_encryption</Icon>
                <Icon left>person</Icon>
                Set user pattern
              </Button>
            )}
            {adminPatternExists && readOnlyPatternExists && (
              <Button waves={waves} className={cx('activator marged col s12 m5 l7', theme.actions.secondary)} onClick={this.setCurrentPatternKey.bind(this, 'readOnly')}>
                <Icon left>lock</Icon>
                <Icon left>person</Icon>
                Change user pattern
              </Button>
            )}
            {adminPatternExists && readOnlyPatternExists && (
              <Button waves={waves} className={cx('marged col s12 m5 l7', theme.actions.inconspicious)} onClick={this.removePattern.bind(this, 'readOnly')}>
                <Icon left>lock_open</Icon>
                <Icon left>person</Icon>
                Remove user pattern
              </Button>
            )}
          </p>
        </div>
        <div className={cx('card-reveal', theme.backgrounds.body)}>
          <span className='card-title pattern-close-card'>Draw a pattern<Icon right>close</Icon></span>
          <div className='center-align '>
            <PatternLock theme={theme} animationLevel={animationLevel} patternCallback={this.patternDraw.bind(this)} />
          </div>
        </div>
      </div>
    )
  }

  setCurrentPatternKey (key) {
    this.setState({
      currentPatternKey: key
    })
  }

  removePattern (key) {
    this.props.serverStorage.removeItem(`security-${key}`)
    .catch(() => {}) // If does not exists, do nothing mre
    .then(() => {
      this.setState({
        [`${key}PatternExists`]: false,
        currentPatternKey: null
      })
    })
  }

  patternDraw (pattern) {
    const patternKey = this.state.currentPatternKey

    this.props.serverStorage.setItem(`security-${patternKey}`, { pattern })
    .then(() => {
      this.setState({
        [`${patternKey}PatternExists`]: true,
        currentPatternKey: null
      })
      $('.pattern-close-card').click()
    })
  }
}

SettingsSecurity.propTypes = {
  theme: PropTypes.object.isRequired,
  serverStorage: PropTypes.object.isRequired,
  showRefreshButton: PropTypes.func.isRequired,
  animationLevel: PropTypes.number.isRequired
}

export default SettingsSecurity
