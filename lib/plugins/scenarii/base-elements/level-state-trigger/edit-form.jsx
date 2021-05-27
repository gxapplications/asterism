'use strict'

/* global $, noUiSlider, wNumb */
import PropTypes from 'prop-types'
import React from 'react'
import { Row, Select } from 'react-materialize'

import { Scenarii } from 'asterism-plugin-library'

const { StatesDropdown } = Scenarii

class BrowserLevelStateTriggerEditForm extends React.Component {
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
    const domSlider = $(`#level-slider-${this.props.instance.instanceId}`)[0]
    if (!domSlider) {
      return
    }

    if (!this._slider || !domSlider.noUiSlider) {
      this._slider = noUiSlider.create(domSlider, {
        start: this.props.instance.data.level || 1,
        connect: true,
        step: 1,
        animate: true,
        range: {
          min: [1, 1],
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

      this._slider.on('change', this.levelChanged.bind(this))
    } else {
      this._slider.set(this.props.instance.data.level)
    }
  }

  render () {
    const { instance, animationLevel, theme, services } = this.props
    const { levelStateId, way } = instance.data

    return (
      <Row className='section card form level-state-trigger-panel'>
        <h6 className='show-in-procedure'>{instance.shortLabel}</h6>
        <br />
        <StatesDropdown
          defaultStateId={levelStateId} onChange={this.levelStateChanged.bind(this)}
          theme={theme} animationLevel={animationLevel} services={services} s={12} label='State that triggers'
          typeFilter={(e) => e.id === 'level-state'} instanceFilter={(e) => e.typeId === 'level-state'}
        />

        <br />&nbsp;
        <br />
        <Select
          s={12} m={4} label='Way' icon='swap_vert' onChange={this.wayChanged.bind(this)}
          defaultValue={way || 'reach'}
        >
          <option key='reach' value='reach'>Level reached</option>
          <option key='upward' value='upward'>Level reached upward</option>
          <option key='downward' value='downward'>Level reached downward</option>
          <option key='left' value='left'>Level left</option>
        </Select>

        <div className='col s12 m8 slider'>
          <div id={`level-slider-${instance.instanceId}`} />
        </div>
      </Row>
    )
  }

  levelStateChanged (value) {
    this.props.instance.data.levelStateId = value
    this.nameChange()
  }

  wayChanged (event) {
    const way = event.currentTarget.value
    this.props.instance.data.way = way
    this.nameChange()
  }

  levelChanged (value) {
    const level = parseInt(value[0].split('.')[0])
    this.props.instance.data.level = level
    this.nameChange()
  }

  nameChange () {
    if (!this.props.instance.data.levelStateId) {
      this.props.instance.data.name = 'Misconfigured level state trigger'
      return
    }

    this.scenariiService.getStateInstance(this.props.instance.data.levelStateId)
      .then((levelState) => {
        switch (this.props.instance.data.way) {
          case 'upward':
            this.props.instance.data.name = `${levelState.data.name} ↱ ${this.props.instance.data.level}`
            break
          case 'downward':
            this.props.instance.data.name = `${levelState.data.name} ↳ ${this.props.instance.data.level}`
            break
          case 'left':
            this.props.instance.data.name = `${levelState.data.name} ↛ ${this.props.instance.data.level}`
            break
          case 'reach':
          default:
            this.props.instance.data.name = `${levelState.data.name} → ${this.props.instance.data.level}`
        }
      })
    this.props.highlightCloseButton()
  }
}

BrowserLevelStateTriggerEditForm.propTypes = {
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserLevelStateTriggerEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserLevelStateTriggerEditForm.label = 'Level state trigger'

export default BrowserLevelStateTriggerEditForm
