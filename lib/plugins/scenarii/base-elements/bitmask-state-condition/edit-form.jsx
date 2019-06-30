'use strict'

/* global $, noUiSlider, wNumb */
import PropTypes from 'prop-types'
import React from 'react'
import { Row, Select } from 'react-materialize'

import { Scenarii } from 'asterism-plugin-library'

const { StatesDropdown } = Scenarii

class BrowserBitmaskStateConditionEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']

    this.state = {
      operator: props.instance.data.operator || 'position-set'
    }
  }

  componentDidMount () {
    this.scenariiService.getStateInstances()
    .then((instances) => {
      if (instances.length === 1) {
        this.props.instance.data.bitmaskStateId = instances[0].instanceId
        this.nameChange()
      } else {
        if (!this.props.instance.data.bitmaskStateId) {
          this.props.instance.data.bitmaskStateId = instances[0].instanceId
          this.nameChange()
        }
        this.plugWidgets()
      }
    })
    this.plugWidgets()
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
    const { operator = 'position-set' } = this.state

    return (
      <Row className='section card form bitmask-state-condition-panel'>
        <div className='col s12'>
          <StatesDropdown defaultStateId={bitmaskStateId} onChange={this.bitmaskStateChanged.bind(this)}
            theme={theme} animationLevel={animationLevel} services={services}
            typeFilter={(e) => e.id === 'bitmask-state'} instanceFilter={(e) => e.typeId === 'bitmask-state'} />
        </div>

        <Select key={0} s={12} label='Operator' icon='navigate_next' onChange={this.changeOperator.bind(this)} defaultValue={operator}>
          <option key='position-set' value='position-set'>Position is set (at 1)</option>
          <option key='position-unset' value='position-unset'>Position is unset (at 0)</option>
          <option key='position-only-set' value='position-only-set'>Position is set (at 1), others are unset</option>
          <option key='position-only-unset' value='position-only-unset'>Position is unset (at 0), others are set</option>
          <option key='all-set' value='all-set'>All positions are set (at max value)</option>
          <option key='all-unset' value='all-unset'>All positions are unset (at min value)</option>
          <option key='only-one-set' value='only-one-set'>Only one position is set, others are unset</option>
          <option key='only-one-unset' value='only-one-unset'>Only one position is unset, others are set</option>
          <option key='have-both' value='have-both'>There is set positions AND unset positions</option>
        </Select>

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
      this.props.instance.data.name = 'Misconfigured bitmask state condition'
      return
    }

    this.scenariiService.getStateInstance(this.props.instance.data.bitmaskStateId)
    .then((bitmaskState) => {
      const position = this.props.instance.data.position
      const positions = Array(bitmaskState.data.count).fill('?')

      switch (this.props.instance.data.operator) {
        case 'position-set':
          this.props.instance.data.name = `${bitmaskState.data.name} = ${positions.map((p, i) => (i + 1) === position ? '1' : '~').reverse().join('')}`
          break
        case 'position-unset':
          this.props.instance.data.name = `${bitmaskState.data.name} = ${positions.map((p, i) => (i + 1) === position ? '0' : '~').reverse().join('')}`
          break
        case 'position-only-set':
          this.props.instance.data.name = `${bitmaskState.data.name} = ${positions.map((p, i) => (i + 1) === position ? '1' : '0').reverse().join('')}`
          break
        case 'position-only-unset':
          this.props.instance.data.name = `${bitmaskState.data.name} = ${positions.map((p, i) => (i + 1) === position ? '0' : '1').reverse().join('')}`
          break
        case 'all-unset':
          this.props.instance.data.name = `${bitmaskState.data.name} = ${positions.map(p => '0').join('')}`
          break
        case 'all-set':
          this.props.instance.data.name = `${bitmaskState.data.name} = ${positions.map(p => '1').join('')}`
          break
        case 'only-one-set':
          this.props.instance.data.name = `${bitmaskState.data.name} has only one 1`
          break
        case 'only-one-unset':
          this.props.instance.data.name = `${bitmaskState.data.name} has only one 0`
          break
        case 'have-both':
          this.props.instance.data.name = `${bitmaskState.data.name} has many 0 and 1`
          break
      }
    })
    this.props.highlightCloseButton()
  }
}

BrowserBitmaskStateConditionEditForm.propTypes = {
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserBitmaskStateConditionEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserBitmaskStateConditionEditForm.label = 'Bitmask state condition'

export default BrowserBitmaskStateConditionEditForm
