'use strict'

import PropTypes from 'prop-types'
import React from 'react'

class SettingsDisplay extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div className='carousel-item' href='#display!'>
        <h2>Components display</h2>

        <div className='section left-align'>
          <h5>Components ordering</h5>
          <p>
            You can save your current components ordering into server, to save and/or to let other devices use it.
            <button className='waves-effect waves-light' onClick={this.saveOrder.bind(this)}>Save current to server</button>
            <button className='waves-effect waves-light' onClick={this.restoreOrder.bind(this)}>Restore from server</button>
          </p>
        </div>

        TODO !3: use gridifier background colors option ?;
        <button onClick={this.props.showRefreshButton} className='waves-effect waves-light btn-flat'>Test</button>
      </div>
    )
  }

  saveOrder () {
    // TODO !0: tester
    const order = this.props.orderHandler.getLocalOrder()
    this.props.serverStorage.setItem('components-order', order)
  }

  restoreOrder () {
    // TODO !0: tester
    const order = this.props.serverStorage.getItem('components-order')
    this.props.orderHandler.setLocalOrder(order)
    this.props.orderHandler.restoreOrder()
  }
}

SettingsDisplay.propTypes = {
  theme: PropTypes.object.isRequired,
  orderHandler: PropTypes.object.isRequired,
  serverStorage: PropTypes.object.isRequired,
  showRefreshButton: PropTypes.func.isRequired
}

export default SettingsDisplay
