'use strict'

/* global $, noUiSlider, wNumb */
import PropTypes from 'prop-types'
import React from 'react'
import { Row, Select } from 'react-materialize'

import { Scenarii } from 'asterism-plugin-library'

const { StatesDropdown } = Scenarii

class BrowserLevelStateConditionEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']

    this.state = {
      operator: props.instance.data.operator,
      level: props.instance.data.level,
      level2: props.instance.data.level2
    }
  }

  componentDidMount () {
    this.plugWidgets()
  }

  componentDidUpdate () {
    this.plugWidgets()
  }

  plugWidgets () {
    const domSlider = $(`#level-slider-${this.props.instance.instanceId}`)[0]
    if (domSlider) {
      if (!this._slider || !domSlider.noUiSlider) {
        this._slider = noUiSlider.create(domSlider, {
          start: this.props.instance.data.level || 1,
          connect: true,
          step: 1,
          animate: true,
          range: {
            'min': [1, 1],
            'max': [32]
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

    const domSlider2 = $(`#level2-slider-${this.props.instance.instanceId}`)[0]
    if (domSlider2) {
      if (!this._slider2 || !domSlider2.noUiSlider) {
        this._slider2 = noUiSlider.create(domSlider2, {
          start: [this.props.instance.data.level || 1, this.props.instance.data.level2 || 2],
          connect: true,
          step: 1,
          animate: true,
          range: {
            'min': [1, 1],
            'max': [32]
          },
          format: wNumb({
            decimals: 1
          }),
          pips: { // Show a scale with the slider
            mode: 'steps',
            stepped: true,
            density: 8
          },
          tooltips: [wNumb({ decimals: 1, edit: (v) => `${v}`.split('.')[0] }), wNumb({ decimals: 1, edit: (v) => `${v}`.split('.')[0] })], // decimals: 0 does not work...
          behaviour: 'tap-drag',
          orientation: 'horizontal'
        })

        this._slider2.on('change', this.levelChanged.bind(this))
      } else {
        this._slider2.set([this.props.instance.data.level || 1, this.props.instance.data.level2 || 2])
      }
    }
  }

  render () {
    const { instance, theme, animationLevel, services } = this.props
    const { levelStateId } = instance.data
    const { operator } = this.state

    return (
      <Row className='section card form level-state-condition-panel'>

        <br />
        <StatesDropdown defaultStateId={levelStateId} onChange={this.levelStateChanged.bind(this)}
          theme={theme} animationLevel={animationLevel} services={services}
          typeFilter={(e) => e.id === 'level-state'} instanceFilter={(e) => e.typeId === 'level-state'} />

        <br />&nbsp;
        <br />
        <Select key={0} s={12} label='Operator' icon='navigate_next' onChange={this.changeOperator.bind(this)} defaultValue={operator}>
          <option key='eq' value='eq'>Equal</option>
          <option key='lte' value='lte'>Less or equal</option>
          <option key='between' value='between'>Between (including limits)</option>
          <option key='gte' value='gte'>Greater or equal</option>
        </Select>

        {operator !== 'between' && (
          <div className='col s12 slider'>
            <div id={`level-slider-${instance.instanceId}`} />
          </div>
        )}

        {operator === 'between' && (
          <div className='col s12 slider'>
            <div id={`level2-slider-${instance.instanceId}`} />
          </div>
        )}
      </Row>
    )
  }

  levelStateChanged (value) {
    this.props.instance.data.levelStateId = value
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

  levelChanged (values) {
    this.props.instance.data.level = parseInt(values[0])
    if (this.props.instance.data.operator === 'between') {
      this.props.instance.data.level2 = parseInt(values[1])
    }
    this.nameChange()
    this.setState({
      level: this.props.instance.data.level,
      level2: this.props.instance.data.level2
    })
  }

  nameChange () {
    if (!this.props.instance.data.levelStateId) {
      this.props.instance.data.name = 'Misconfigured level state condition'
      return
    }

    this.scenariiService.getStateInstance(this.props.instance.data.levelStateId)
    .then((levelState) => {
      switch (this.props.instance.data.operator) {
        case 'eq':
          this.props.instance.data.name = `${levelState.data.name} = ${this.props.instance.data.level}`
          break
        case 'lte':
          this.props.instance.data.name = `${levelState.data.name} ≤ ${this.props.instance.data.level}`
          break
        case 'between':
          this.props.instance.data.name = `${levelState.data.name} in [${this.props.instance.data.level}-${this.props.instance.data.level2}]`
          break
        case 'gte':
          this.props.instance.data.name = `${levelState.data.name} ≥ ${this.props.instance.data.level}`
      }
    })
    this.props.highlightCloseButton()
  }
}

BrowserLevelStateConditionEditForm.propTypes = {
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserLevelStateConditionEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserLevelStateConditionEditForm.label = 'Level state condition'

export default BrowserLevelStateConditionEditForm
