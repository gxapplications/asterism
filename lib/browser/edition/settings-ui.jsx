'use strict'

/* global $ */
import cx from 'classnames'
import objectPath from 'object-path'
import PropTypes from 'prop-types'
import React from 'react'
import { CirclePicker } from 'react-color'
import { Button, Icon, Input } from 'react-materialize'

class SettingsUserInterface extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      colorField: 'backgrounds.card',
      currentColor: props.theme.backgrounds.card,
      theme: { backgrounds: props.theme.backgrounds, actions: props.theme.actions, feedbacks: props.theme.feedbacks },
      continuousRecognition: props.localStorage.getItem('settings-speech-continuous-recognition') || false
    }

    this.colors = props.theme.palette
  }

  render () {
    const { localStorage, theme, animationLevel } = this.props
    const { currentColor, continuousRecognition } = this.state
    const level = parseInt(localStorage.getItem('settings-animation-level') || 3)
    const mainLanguage = localStorage.getItem('settings-speech-main-language') || 'en-US'

    return (
      <div className='card'>
        <div className='section left-align'>
          <h5>Elements' palette</h5>
          <div className='row'>
            {theme.editableElements.map((el, idx) => (
              <Button waves={animationLevel >= 2 ? 'light' : null}
                className={cx('activator marged col s12 m5', objectPath.get(theme, el.key))}
                key={idx} onClick={this.selectColor.bind(this, el.key)}>
                {el.label}
              </Button>
            ))}
          </div>
        </div>
        <div className='section left-align'>
          <h5>Animations</h5>
          <p>
            <input name='animationLevel' type='radio' value='3' id='animationLevel3'
              onClick={this.setAnimationLevel.bind(this, 3)} defaultChecked={level === 3} />
            <label htmlFor='animationLevel3' className='truncate'>High animation level, my device is strong enough!</label>
          </p>
          <p>
            <input name='animationLevel' type='radio' value='2' id='animationLevel2'
              onClick={this.setAnimationLevel.bind(this, 2)} defaultChecked={level === 2} />
            <label htmlFor='animationLevel2' className='truncate'>Medium animation level, need to be fluent.</label>
          </p>
          <p>
            <input className='with-gap' name='animationLevel' type='radio' value='1' id='animationLevel1'
              onClick={this.setAnimationLevel.bind(this, 1)} defaultChecked={level === 1} />
            <label htmlFor='animationLevel1' className='truncate'>Low animation level, my device is a dinosaur...</label>
          </p>
        </div>
        <div className='section left-align'>
          <h5>Speech and speak</h5>
          <div className='section card form'>
            <Input s={12} name='continuousRecognition' type='switch' defaultChecked={continuousRecognition}
              onChange={this.changeContinuousRecognition.bind(this)}
              onLabel='Continuous recognition with keyword' offLabel='When mic button pressed' />
            <br />
            <Input s={12} type='select' label={continuousRecognition ? 'Main language for speech keywords detection' : 'Speech language'}
              icon='language' onChange={this.changeMainLanguage.bind(this)}
              defaultValue={mainLanguage}>
              <option value='en-US'>English</option>
              <option value='fr-FR'>French</option>
              <option value='zh-CN'>Chinese</option>
            </Input>
            <br />
            {continuousRecognition ? (
              <span>
                TODO !3: list with up to 3 tuples: [ language, 'OK google keyword for this language' ]
              </span>
            ) : <br /> }
            <br />
          </div>
        </div>
        <div className={cx('card-reveal', theme.backgrounds.body)}>
          <span className='card-title'>Choose a color<Icon right>close</Icon></span>
          <div className='center-align circle-picker-container'>
            <CirclePicker width={340} circleSize={26} circleSpacing={-2} colors={this.colors}
              color={this.colors[currentColor]} onChangeComplete={this.setColor.bind(this)} />
          </div>
        </div>
      </div>
    )
  }

  selectColor (field) {
    this.setState({ ...this.state, colorField: field, currentColor: objectPath.get(this.state.theme, field) })
  }

  setColor (color, event) {
    const theme = { ...this.state.theme }

    for (var colorName in this.colors) {
      if (this.colors[colorName].toLowerCase() === color.hex) {
        objectPath.set(theme, this.state.colorField, colorName)
        this.setState({ ...this.state, theme, currentColor: colorName })
        this.props.localStorage.setItem('settings-theme', theme)
        this.props.showRefreshButton()
        break
      }
    }

    // close .card-reveal div
    $('#settings-modal .card .card-reveal .card-title').click()
  }

  setAnimationLevel (level) {
    this.props.localStorage.setItem('settings-animation-level', level)
    this.props.showRefreshButton()
  }

  changeContinuousRecognition (event, active) {
    active = (active === true) // true => true; "on" => false ...
    this.props.localStorage.setItem('settings-speech-continuous-recognition', active)
    this.setState({ continuousRecognition: active })
    this.props.showRefreshButton()
  }

  changeMainLanguage (event, value) {
    this.props.localStorage.setItem('settings-speech-main-language', value)
    this.props.showRefreshButton()
  }
}

SettingsUserInterface.propTypes = {
  theme: PropTypes.object.isRequired,
  localStorage: PropTypes.object.isRequired,
  showRefreshButton: PropTypes.func.isRequired,
  animationLevel: PropTypes.number.isRequired
}

export default SettingsUserInterface
