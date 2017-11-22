'use strict'

import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Button, Icon } from 'react-materialize'

class SettingsDisplay extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { theme, animationLevel } = this.props
    const waves = animationLevel >= 2 ? 'light' : undefined

    return (
      <div>
        <div className='section left-align'>
          <h5>Components ordering</h5>
          <p>
            You can save your current components ordering into server, to backup and/or to let your other devices use it.
          </p>
          <p className='row'>
            <Button waves={waves} onClick={this.saveOrder.bind(this)} className={cx('marged col s12 m5', theme.actions.primary)}>
              <Icon left>devices</Icon>
              <Icon left>keyboard_arrow_right</Icon>
              <Icon left>storage</Icon>
              &nbsp; <span className='hide-on-med-and-down'>Save current to server</span><span className='hide-on-large-only'>Save</span>
            </Button>
            <Button waves={waves} onClick={this.restoreOrder.bind(this)} className={cx('marged col s12 m5', theme.actions.primary)}>
              <Icon left>storage</Icon>
              <Icon left>keyboard_arrow_right</Icon>
              <Icon left>devices</Icon>
              &nbsp; <span className='hide-on-med-and-down'>Restore from server</span><span className='hide-on-large-only'>Restore</span>
            </Button>
          </p>
        </div>
      </div>
    )
  }

  saveOrder () {
    const order = this.props.itemManager.orderHandler.getLocalOrder()
    return this.props.serverStorage.setItemForPath('order-handler', order)
  }

  restoreOrder () {
    this.props.itemManager.applyServerOrder()
  }
}

SettingsDisplay.propTypes = {
  theme: PropTypes.object.isRequired,
  itemManager: PropTypes.object.isRequired,
  serverStorage: PropTypes.object.isRequired,
  showRefreshButton: PropTypes.func.isRequired,
  animationLevel: PropTypes.number.isRequired
}

export default SettingsDisplay
