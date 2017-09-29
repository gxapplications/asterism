'use strict'

import PropTypes from 'prop-types'
import React from 'react'

class IpCamSettings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div className='carousel-item' href='#ipcam!'>
        <h2>IpCamSettings</h2>

      </div>
    )
  }
}

IpCamSettings.propTypes = {
  theme: PropTypes.object.isRequired,
  showRefreshButton: PropTypes.func.isRequired
}

export default IpCamSettings
