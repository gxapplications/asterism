'use strict'

import PropTypes from 'prop-types'
import React from 'react'

class DeveloperToolsSettings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div className='carousel-item' href='#devtools!'>
        <h2>Developer tools</h2>

      </div>
    )
  }
}

DeveloperToolsSettings.propTypes = {
  theme: PropTypes.object.isRequired,
  showRefreshButton: PropTypes.func.isRequired
}

export default DeveloperToolsSettings
