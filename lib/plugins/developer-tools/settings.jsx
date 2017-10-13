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
      <div>
        <div className='section left-align'>
          <h5>... in construction!</h5>
        </div>
      </div>
    )
  }
}

DeveloperToolsSettings.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  showRefreshButton: PropTypes.func.isRequired
}

DeveloperToolsSettings.tabName = 'Dev tools'

export default DeveloperToolsSettings
