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
        TODO: save cards order into server;
        TODO: use background colors ?;
        <button onClick={this.props.showRefreshButton} className='waves-effect waves-light btn-flat'>Test</button>
      </div>
    )
  }

}

SettingsDisplay.propTypes = {
  theme: PropTypes.object.isRequired,
  showRefreshButton: PropTypes.func.isRequired
}

export default SettingsDisplay
