'use strict'

import PropTypes from 'prop-types'
import React from 'react'
import { Row, Select, TextInput } from 'react-materialize'

class BrowserWebPushNotificatorEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']
  }

  render () {
    const { instance } = this.props
    const { title, body, level, unicity } = instance.data

    return (
      <Row className='section card form webPushNotificatorPanel'>
        <br />
        <Select s={12} m={4} label='Level' icon='announcement' onChange={this.levelChanged.bind(this)}
          defaultValue={level || 'info'}>
          <option key='info' value='info'>Info</option>
          <option key='warning' value='warning'>Warning</option>
          <option key='error' value='error'>Error</option>
        </Select>

        <TextInput placeholder='From Asterism' s={12} m={8} label='Notification title' defaultValue={title} data-length={64}
          onChange={(e) => { instance.data.title = e.currentTarget.value.substring(0, 64); this.props.highlightCloseButton() }} />
        <div className='col s12'>&nbsp;</div>

        <TextInput placeholder='Hello world!' s={12} label='Notification content' defaultValue={body}
          onChange={(e) => { instance.data.body = e.currentTarget.value; this.props.highlightCloseButton() }} />
        <div className='col s12'>&nbsp;</div>

        <TextInput placeholder='(advanced use)' s={12} label='Unicity identifier' defaultValue={unicity} data-length={32}
          onChange={(e) => { instance.data.unicity = e.currentTarget.value.substring(0, 32); this.props.highlightCloseButton() }} />
      </Row>
    )
  }

  levelChanged (event) {
    this.props.instance.data.level = event.currentTarget.value
    this.props.highlightCloseButton()
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
