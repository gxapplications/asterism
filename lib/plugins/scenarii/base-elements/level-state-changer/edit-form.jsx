'use strict'

/* global $, noUiSlider, wNumb */
import PropTypes from 'prop-types'
import React from 'react'
import { Select, Row } from 'react-materialize'

import { Scenarii } from 'asterism-plugin-library'

const { StatesDropdown } = Scenarii

class BrowserLevelStateChangerEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']
  }

  componentDidMount () {
    this.plugWidgets()
  }

  componentDidUpdate (prevProps, prevState) {
    this.plugWidgets()
  }

  plugWidgets () {
    const domSlider = $(`#amount-slider-${this.props.instance.instanceId}`)[0]
    if (!domSlider) {
      return
    }

    if (!this._slider || !domSlider.noUiSlider) {
      this._slider = noUiSlider.create(domSlider, {
        start: this.props.instance.data.amount || 1,
        connect: true,
        step: 1,
        animate: true,
        range: {
          min: [1],
          '81%': [10, 6],
          '91%': [16, 16],
          max: [32]
        },
        format: wNumb({
          decimals: 1
        }),
        pips: { // Show a scale with the slider
          mode: 'steps',
          stepped: true,
          density: 8
        },
        tooltips: wNumb({ decimals: 1, edit: (v) => `${v}`.split('.')[0] }), // decimals: 0 does not work...
        behaviour: 'tap-drag',
        orientation: 'horizontal'
      })

      this._slider.on('change', this.amountChanged.bind(this))
    } else {
      this._slider.set(this.props.instance.data.amount)
    }
  }

  render () {
    const { instance, animationLevel, theme, services } = this.props

    return (
      <Row className='section card form levelStateChangerPanel'>
        <h6 className='show-in-procedure'>{instance.shortLabel}</h6>
        <br />
        <StatesDropdown
          defaultStateId={instance.data.levelStateId} onChange={this.levelStateChanged.bind(this)}
          theme={theme} animationLevel={animationLevel} services={services} s={12} label='State to update'
          typeFilter={(e) => e.id === 'level-state'} instanceFilter={(e) => e.typeId === 'level-state'}
        />

        <br />&nbsp;
        <br />
        <Select
          s={12} m={4} label='Operation' icon='swap_vert' onChange={this.operationChanged.bind(this)}
          defaultValue={instance.data.operation || 'replace'}
        >
          <option key='replace' value='replace'>Set value</option>
          <option key='increment' value='increment'>Increment value</option>
          <option key='decrement' value='decrement'>Decrement value</option>
        </Select>

        <div className='col s12 m8 slider'>
          <div id={`amount-slider-${instance.instanceId}`} />
        </div>
      </Row>
    )
  }

  levelStateChanged (value) {
    this.props.instance.data.levelStateId = value
    this.nameChange()
  }

  operationChanged (event) {
    const operation = event.currentTarget.value
    this.props.instance.data.operation = operation
    this.nameChange()
  }

  amountChanged (value) {
    const amount = parseInt(value[0].split('.')[0])
    this.props.instance.data.amount = amount
    this.nameChange()
  }

  nameChange () {
    if (!this.props.instance.data.levelStateId) {
      this.props.instance.data.name = 'Misconfigured level state updater'
      return
    }

    this.scenariiService.getStateInstance(this.props.instance.data.levelStateId)
      .then((levelState) => {
        switch (this.props.instance.data.operation) {
          case 'increment':
            if (this.props.instance.data.amount === 1) {
              this.props.instance.data.name = `${levelState.data.name} ++`
            } else {
              this.props.instance.data.name = `∆ ${levelState.data.name} +${this.props.instance.data.amount}`
            }
            break
          case 'decrement':
            if (this.props.instance.data.amount === 1) {
              this.props.instance.data.name = `${levelState.data.name} --`
            } else {
              this.props.instance.data.name = `∇ ${levelState.data.name} -${this.props.instance.data.amount}`
            }
            break
          case 'replace':
          default:
            this.props.instance.data.name = `${levelState.data.name} = ${this.props.instance.data.amount}`
        }
      })
    this.props.highlightCloseButton()
  }
}

BrowserLevelStateChangerEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserLevelStateChangerEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserLevelStateChangerEditForm.label = 'Level state changer'

export default BrowserLevelStateChangerEditForm
