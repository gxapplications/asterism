'use strict'

/* global $, noUiSlider, wNumb */
import PropTypes from 'prop-types'
import React from 'react'
import { Row, Input } from 'react-materialize'

import { Scenarii } from 'asterism-plugin-library'

const { StatesDropdown } = Scenarii

class BrowserBitmaskStateTriggerEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']

    this.state = {
      operator: props.instance.data.operator || 'position-move'
    }
  }

  componentDidMount () {
    this.scenariiService.getStateInstances()
    .then((instances) => {
      if (instances.length === 1) {
        this.props.instance.data.bitmaskStateId = instances[0].instanceId
        this.plugWidgets()
        this.nameChange()
      } else {
        if (!this.props.instance.data.bitmaskStateId) {
          this.props.instance.data.bitmaskStateId = instances[0].instanceId
          this.nameChange()
        }
        this.plugWidgets()
      }
    })
  }

  componentDidUpdate () {
    this.plugWidgets()
  }

  plugWidgets () {
    const domSlider = $(`#bitmask-slider-${this.props.instance.instanceId}`)[0]
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
            'min': [1, 1],
            'max': [this._sliderCount]
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
                'min': [1, 1],
                'max': [this._sliderCount]
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
    const { instance, theme, animationLevel, services } = this.props
    const { bitmaskStateId } = instance.data
    const { operator = 'position-move' } = this.state

    return (
      <Row className='section card form bitmask-state-trigger-panel'>
        <div className='col s12'>
          <StatesDropdown defaultStateId={bitmaskStateId} onChange={this.bitmaskStateChanged.bind(this)}
            theme={theme} animationLevel={animationLevel} services={services}
            typeFilter={(e) => e.id === 'bitmask-state'} instanceFilter={(e) => e.typeId === 'bitmask-state'} />
        </div>

        <Input key={0} s={12} label='Operator' type='select' icon='navigate_next' onChange={this.changeOperator.bind(this)} defaultValue={operator || 'position-move'}>
          <option key='position-move' value='position-move'>Specific position changed</option>
          <option key='position-set' value='position-set'>Specific position set (changed to 1)</option>
          <option key='position-unset' value='position-unset'>Specific position unset (changed to 0)</option>
          <option key='any-move' value='any-move'>Any position changed</option>
          <option key='any-set' value='any-set'>Any position set (changed to 1)</option>
          <option key='any-unset' value='any-unset'>Any position unset (changed to 0)</option>
        </Input>

        {operator.match(/^position-/) && (
          <div className='col s12 m9 slider'>
            <div id={`bitmask-slider-${instance.instanceId}`} />
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

  changeOperator (event) {
    const operator = event.currentTarget.value
    this.props.instance.data.operator = operator
    this.nameChange()
    this.setState({
      operator
    })
  }

  positionChanged (value) {
    const position = parseInt(value[0].split('.')[0])
    this.props.instance.data.position = position
    this.nameChange()
  }

  nameChange () {
    if (!this.props.instance.data.bitmaskStateId) {
      this.props.instance.data.name = 'Misconfigured bitmask state trigger'
      return
    }

    this.scenariiService.getStateInstance(this.props.instance.data.bitmaskStateId)
    .then((bitmaskState) => {
      const position = this.props.instance.data.position
      const positions = Array(bitmaskState.data.count).fill('?')

      switch (this.props.instance.data.operator) {
        case 'position-set':
          this.props.instance.data.name = `${bitmaskState.data.name}: ${positions.map((p, i) => (i + 1) === position ? '0' : '~').reverse().join('')} ⇨ ${positions.map((p, i) => (i + 1) === position ? '1' : '~').reverse().join('')}`
          break
        case 'position-unset':
          this.props.instance.data.name = `${bitmaskState.data.name}: ${positions.map((p, i) => (i + 1) === position ? '1' : '~').reverse().join('')} ⇨ ${positions.map((p, i) => (i + 1) === position ? '0' : '~').reverse().join('')}`
          break
        case 'position-move':
          this.props.instance.data.name = `${bitmaskState.data.name} changed at ${positions.map((p, i) => (i + 1) === position ? 'X' : '~').reverse().join('')}`
          break
        case 'any-set':
          this.props.instance.data.name = `${bitmaskState.data.name} changed to set (to 1) at any position`
          break
        case 'any-unset':
          this.props.instance.data.name = `${bitmaskState.data.name} changed to unset (to 0) at any position`
          break
        case 'any-move':
          this.props.instance.data.name = `${bitmaskState.data.name} changed at any position`
          break
      }
    })
    this.props.highlightCloseButton()
  }
}

BrowserBitmaskStateTriggerEditForm.propTypes = {
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserBitmaskStateTriggerEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserBitmaskStateTriggerEditForm.label = 'Bitmask state trigger'

export default BrowserBitmaskStateTriggerEditForm
