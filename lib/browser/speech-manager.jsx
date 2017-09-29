'use strict'

// import PropTypes from 'prop-types'
import cx from 'classnames'
import { NavItem, Icon } from 'react-materialize'
import React from 'react'

export default class SpeechManager {
  constructor () {
    this.speechAvailable = 'webkitSpeechRecognition' in window
  }

  speech () {
    console.log('TODO') // TODO !5
  }

  getComponent () {
    const available = this.speechAvailable
    return ({ animationLevel }) => (
      <NavItem className={cx(available && animationLevel >= 2 ? 'waves-effect waves-light' : '', { 'speech-disabled': !available })}
        href='javascript:void(0)' onClick={() => { if (available) { this.speech() } }}
      >
        <Icon>{available ? 'mic' : 'mic_off'}</Icon>
      </NavItem>
    )
  }
}
