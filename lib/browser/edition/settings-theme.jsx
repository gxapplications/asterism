'use strict'

/* global $ */
import cx from 'classnames'
import objectPath from 'object-path'
import PropTypes from 'prop-types'
import React from 'react'
import { CirclePicker } from 'react-color'
import { Button, Icon } from 'react-materialize'

class SettingsTheme extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      colorField: 'backgrounds.card',
      currentColor: props.theme.backgrounds.card,
      theme: { backgrounds: props.theme.backgrounds, actions: props.theme.actions, feedbacks: props.theme.feedbacks }
    }

    this.colors = props.theme.palette
  }

  render () {
    const { theme } = this.props
    const { currentColor } = this.state

    return (
      <div className='carousel-item card' href='#theme!'>
        <h2>Theme</h2>
        <div className='section left-align'>
          <div className='row'>
            <div className='col s12'>
              {theme.editableElements.map((el, idx) => (
                <Button waves='light' className={cx('activator marged', objectPath.get(theme, el.key))}
                  key={idx} onClick={this.selectColor.bind(this, el.key)}>
                  {el.label}
                </Button>
              ))}
            </div>
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
    $('#settings-modal .carousel .carousel-item.card .card-reveal .card-title').click()
  }
}

SettingsTheme.propTypes = {
  theme: PropTypes.object.isRequired,
  localStorage: PropTypes.object.isRequired,
  showRefreshButton: PropTypes.func.isRequired
}

export default SettingsTheme
