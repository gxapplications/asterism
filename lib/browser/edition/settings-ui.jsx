'use strict'

/* global $ */
import cx from 'classnames'
import objectPath from 'object-path'
import PropTypes from 'prop-types'
import React from 'react'
import { CirclePicker } from 'react-color'
import { Button, Icon, RadioGroup, Select, Switch } from 'react-materialize'

class SettingsUserInterface extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      colorField: 'backgrounds.card',
      currentColor: props.theme.backgrounds.card,
      theme: { backgrounds: props.theme.backgrounds, actions: props.theme.actions, feedbacks: props.theme.feedbacks },
      continuousRecognition: props.localStorage.getItem('settings-speech-continuous-recognition') || false,
      animation: props.localStorage.getItem('settings-animation-level') || 3,
      mainLanguage: props.localStorage.getItem('settings-speech-main-language') || 'en-US'
    }

    this.colors = props.theme.palette
  }

  shouldComponentUpdate (nextProps, nextState) {
    const comparator = (i) => [
      i.animation,
      i.colorField,
      i.continuousRecognition,
      i.constructor,
      i.mainLanguage,
      i.theme
    ]
    return JSON.stringify(comparator(this.state)) !== JSON.stringify(comparator(nextState))
  }

  render () {
    const { theme, animationLevel, mainState } = this.props
    const { currentColor, continuousRecognition, animation, mainLanguage } = this.state
    const waves = animationLevel >= 2 ? 'light' : undefined
    const { deferredInstallPrompt } = mainState()

    return (
      <div className='card'>
        {deferredInstallPrompt && (<div className='section left-align'>
          <h5><Icon left>add_to_home_screen</Icon>Application for mobile</h5>
          <p>
            Add the application as a WebAPK on your mobile device.
          </p>
          <p className='row'>
            <Button waves={waves} className={cx('marged col s12 m5 l7', theme.actions.secondary)}
              onClick={() => deferredInstallPrompt.prompt().then(accepted => {
                if (accepted) {
                  this.forceUpdate()
                }
              })}>
              <Icon left>add_to_home_screen</Icon>
              Install app !
            </Button>
          </p>
        </div>)}
        <div className='section left-align'>
          <h5><Icon left>view_quilt</Icon>Components ordering</h5>
          <p>
            You can save your current components ordering into server, to backup and/or to let your other devices use it.
          </p>
          <p className='row'>
            <Button waves={waves} onClick={this.saveOrder.bind(this)} className={cx('marged col s12 m5 l7', theme.actions.primary)}>
              <Icon left>devices</Icon>
              <Icon left>keyboard_arrow_right</Icon>
              <Icon left>storage</Icon>
              &nbsp; <span className='hide-on-med-and-down'>Save current to server</span><span className='hide-on-large-only'>Save</span>
            </Button>
            <Button waves={waves} onClick={this.restoreOrder.bind(this)} className={cx('marged col s12 m5 l7', theme.actions.primary)}>
              <Icon left>storage</Icon>
              <Icon left>keyboard_arrow_right</Icon>
              <Icon left>devices</Icon>
              &nbsp; <span className='hide-on-med-and-down'>Restore from server</span><span className='hide-on-large-only'>Restore</span>
            </Button>
          </p>
        </div>
        <div className='section left-align'>
          <h5><Icon left>palette</Icon>Elements' colors</h5>
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
          <h5><Icon left>photo_filter</Icon>Animations</h5>
          <RadioGroup
            name='animationLevel'
            label='Animations level' withGap
            onChange={this.setAnimationLevel.bind(this)}
            value={`${animation}`}
            radioClassNames='radio-group-column'
            options={[
              { label: 'High animation level, my device is strong enough!', value: '3' },
              { label: 'Medium animation level, need to be fluent.', value: '2' },
              { label: 'Low animation level, my device is a dinosaur...', value: '1' }
            ]}
          />
        </div>
        <div className='section left-align'>
          <h5><Icon left>keyboard_voice</Icon>Speech and speak</h5>
          <div className='section card form'>
            <Switch s={12} name='continuousRecognition' checked={continuousRecognition}
              onChange={this.changeContinuousRecognition.bind(this)}
              onLabel='Continuous recognition with keyword' offLabel='When mic button pressed' />
            <br />
            <br />
            <Select s={12} label={continuousRecognition ? 'Main language for speech keywords detection' : 'Speech language'}
              icon='language' onChange={this.changeMainLanguage.bind(this)}
              value={mainLanguage}>
              <option value='en-US'>English</option>
              <option value='fr-FR'>French</option>
              <option value='zh-CN'>Chinese</option>
            </Select>
            <br />
            {continuousRecognition ? (
              <span>
                TODO !4: list with up to 3 tuples: [ language, 'OK google keyword for this language' ]
              </span>
            ) : <br /> }
            <br />
          </div>
        </div>
        <br />
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

  saveOrder () {
    const order = this.props.itemManager.orderHandler.getLocalOrder()
    return this.props.serverStorage.setItemForPath('order-handler', order)
  }

  restoreOrder () {
    this.props.itemManager.applyServerOrder()
    .then(() => window.location.reload())
  }

  selectColor (field) {
    this.setState({ ...this.state, colorField: field, currentColor: objectPath.get(this.state.theme, field) })
  }

  setColor (color) {
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
    setTimeout(this.forceUpdate.bind(this), 50)
  }

  setAnimationLevel (event) {
    this.props.localStorage.setItem('settings-animation-level', event.currentTarget.value)
    this.setState({ animation: event.currentTarget.value })
    this.props.showRefreshButton()
  }

  changeContinuousRecognition (event) {
    const active = (event.currentTarget.checked === true)
    this.props.localStorage.setItem('settings-speech-continuous-recognition', active)
    this.setState({ continuousRecognition: active })
    this.props.showRefreshButton()
  }

  changeMainLanguage (event) {
    this.props.localStorage.setItem('settings-speech-main-language', event.currentTarget.value)
    this.props.showRefreshButton()
  }
}

SettingsUserInterface.propTypes = {
  theme: PropTypes.object.isRequired,
  itemManager: PropTypes.object.isRequired,
  serverStorage: PropTypes.object.isRequired,
  localStorage: PropTypes.object.isRequired,
  showRefreshButton: PropTypes.func.isRequired,
  animationLevel: PropTypes.number.isRequired,
  mainState: PropTypes.func.isRequired
}

export default SettingsUserInterface
