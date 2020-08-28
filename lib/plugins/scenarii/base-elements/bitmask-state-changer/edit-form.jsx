'use strict'

/* global $, noUiSlider, wNumb */
import PropTypes from 'prop-types'
import React from 'react'
import { Select, Row } from 'react-materialize'

import { Scenarii } from 'asterism-plugin-library'

const { StatesDropdown } = Scenarii

class BrowserBitmaskStateChangerEditForm extends React.Component {
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
    const domSlider = $(`#position-slider-${this.props.instance.instanceId}`)[0]
    if (!domSlider) {
      return
    }
    this.scenariiService.getStateInstance(this.props.instance.data.bitmaskStateId)
      .then((bitmaskState) => {
        if (!this._slider || !domSlider.noUiSlider) {
          this._sliderCount = bitmaskState.data.count
          this._slider = noUiSlider.create(domSlider, {
            start: this.props.instance.data.position || 1,
            connect: true,
            step: 1,
            animate: true,
            range: {
              min: [1, 1],
              max: [this._sliderCount]
            },
            format: wNumb({
              decimals: 1
            }),
            pips: { // Show a scale with the slider
              mode: 'steps',
              stepped: true,
              density: 16
            },
            tooltips: wNumb({ decimals: 1, edit: (v) => `${v}`.split('.')[0] }), // decimals: 0 does not work...
            behaviour: 'tap-drag',
            orientation: 'horizontal'
          })

          this._slider.on('change', this.positionChanged.bind(this))
        } else {
          if (this._sliderCount !== bitmaskState.data.count) {
            this._sliderCount = bitmaskState.data.count
            this._slider.updateOptions(
              {
                range: {
                  min: [1, 1],
                  max: [this._sliderCount]
                }
              },
              true
            )
            domSlider.querySelector('.noUi-pips').remove()
            this._slider.pips({
              mode: 'steps',
              stepped: true,
              density: 16
            })
          }
          this._slider.set(this.props.instance.data.position)
        }
      })
  }

  render () {
    const { instance, animationLevel, theme, services } = this.props

    return (
      <Row className='section card form bitmaskStateChangerPanel'>
        <br />
        <StatesDropdown
          defaultStateId={instance.data.bitmaskStateId} onChange={this.bitmaskStateChanged.bind(this)}
          theme={theme} animationLevel={animationLevel} services={services} s={12} label='State to update'
          typeFilter={(e) => e.id === 'bitmask-state'} instanceFilter={(e) => e.typeId === 'bitmask-state'}
        />

        <br />&nbsp;
        <br />
        <Select
          s={12} m={4} label='Operation' icon='swap_vert' onChange={this.operationChanged.bind(this)}
          defaultValue={instance.data.operation || 'set-position'}
        >
          <option key='set-position' value='set-position'>Set position (to 1)</option>
          <option key='unset-position' value='unset-position'>Unset position (to 0)</option>
          <option key='invert-position' value='invert-position'>Invert position state</option>
          <option key='set-all' value='set-all'>Set all positions (to 1)</option>
          <option key='unset-all' value='unset-all'>Unset all positions (to 0)</option>
        </Select>

        {instance.data.operation.includes('-position') && (
          <div className='col s12 m8 slider'>
            <div id={`position-slider-${instance.instanceId}`} />
          </div>
        )}
      </Row>
    )
  }

  bitmaskStateChanged (value) {
    this.props.instance.data.bitmaskStateId = value
    this.forceUpdate()
    this.plugWidgets()
    this.nameChange()
  }

  operationChanged (event) {
    const operation = event.currentTarget.value
    this.props.instance.data.operation = operation
    this.forceUpdate()
    this.nameChange()
  }

  positionChanged (value) {
    const position = parseInt(value[0].split('.')[0])
    this.props.instance.data.position = position
    this.nameChange()
  }

  nameChange () {
    if (!this.props.instance.data.bitmaskStateId) {
      this.props.instance.data.name = 'Misconfigured bitmask state updater'
      return
    }

    this.scenariiService.getStateInstance(this.props.instance.data.bitmaskStateId)
      .then((bitmaskState) => {
        const positions = Array(bitmaskState.data.count).fill('?')
        switch (this.props.instance.data.operation) {
          case 'set-position':
          default:
            this.props.instance.data.name = `${bitmaskState.data.name} => ${positions.map((p, i) => (i + 1) === this.props.instance.data.position ? '1' : '~').reverse().join('')}`
            break
          case 'unset-position':
            this.props.instance.data.name = `${bitmaskState.data.name} => ${positions.map((p, i) => (i + 1) === this.props.instance.data.position ? '0' : '~').reverse().join('')}`
            break
          case 'invert-position':
            this.props.instance.data.name = `${bitmaskState.data.name} => ${positions.map((p, i) => (i + 1) === this.props.instance.data.position ? '⇅' : '~').reverse().join('')}`
            break
          case 'unset-all':
            this.props.instance.data.name = `${bitmaskState.data.name} = ${positions.map(p => '0').join('')}`
            break
          case 'set-all':
            this.props.instance.data.name = `${bitmaskState.data.name} = ${positions.map(p => '1').join('')}`
        }
      })
    this.props.highlightCloseButton()
  }
}

BrowserBitmaskStateChangerEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserBitmaskStateChangerEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserBitmaskStateChangerEditForm.label = 'Bitmask state changer'

export default BrowserBitmaskStateChangerEditForm
