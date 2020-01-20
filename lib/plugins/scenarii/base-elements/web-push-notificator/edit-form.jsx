'use strict'

import PropTypes from 'prop-types'
import React from 'react'
import { Row } from 'react-materialize'

class BrowserWebPushNotificatorEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']
  }

  render () {
    // const { instance, animationLevel, theme, services } = this.props

    return (
      <Row className='section card form webPushNotificatorPanel'>
        <br />
        TODO
      </Row>
    )
  }
}

BrowserWebPushNotificatorEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserWebPushNotificatorEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserWebPushNotificatorEditForm.label = 'Web Push notificator'

export default BrowserWebPushNotificatorEditForm
