'use strict'

/* global $, noUiSlider, wNumb */
import PropTypes from 'prop-types'
import React from 'react'
import { Select, Row, TimePicker } from 'react-materialize'
import uuid from 'uuid'

class BrowserWaitEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']

    this.state = {
      waitMode: props.instance.data.waitMode || 'amount'
    }
  }

  componentDidMount (prevProps, prevState) {
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
          'min': [1],
          '15%': [5, 5],
          '35%': [30, 10],
          '46%': [60, 15],
          '52%': [90, 30],
          '70%': [240, 60],
          '75%': [300, 50],
          'max': [600]
        },
        format: wNumb({
          decimals: 1
        }),
        pips: { // Show a scale with the slider
          mode: 'steps',
          stepped: true,
          density: 4
        },
        tooltips: wNumb({ decimals: 1, edit: (v) => `${v}`.split('.')[0] }), // decimals: 0 does not work...
        behaviour: 'tap-drag',
        orientation: 'horizontal'
      })

      this._slider.on('change', this.changeAmount.bind(this))
    } else {
      this._slider.set(this.props.instance.data.amount)
    }
  }

  render () {
    const { instance } = this.props
    const { waitMode, amountUnit, until, untilOccurrence, untilQuarter } = instance.data
    const timePickerId = uuid.v4()
    return (
      <Row className='section card form waitPanel'>
        <br />
        <Select key={0} s={12} label='Mode' icon={waitMode === 'amount' ? 'timer' : (waitMode === 'until' ? 'timelapse' : 'av_timer')} onChange={this.changeWaitMode.bind(this)}
          defaultValue={waitMode}>
          <option key='amount' value='amount'>Wait a lapse of time</option>
          <option key='until' value='until'>Wait until a specific moment</option>
          <option key='hours' value='untilQuarter'>Wait until next round quarter hour</option>
        </Select>
        <div className='col s12'>&nbsp;</div>
        <hr className='col s12' />
        <div className='col s12'>&nbsp;</div>

        {waitMode === 'amount' && [
          <Select key={1} s={12} m={12} l={2} label='Unit' icon='timer' onChange={this.changeAmountUnit.bind(this)}
            defaultValue={amountUnit}>
            <option key='seconds' value='seconds'>seconds</option>
            <option key='minutes' value='minutes'>minutes</option>
            <option key='hours' value='hours'>hours</option>
          </Select>,
          <div key={2} className='col s12 m12 l10 slider'>
            <div id={`amount-slider-${instance.instanceId}`} />
          </div>
        ]}

        {waitMode === 'until' && [
          <div key={3} className='input-field col s12 m8 l6'>
            <label className={'col s5'} htmlFor={timePickerId}>Time:</label>
            <TimePicker className={'col offset-s5 s7'} id={timePickerId} options={{
              twelveHour: false,
              autoClose: true,
              defaultTime: until || '12:00',
              showClearBtn: false
            }} onChange={this.changeUntil.bind(this)} value={until || '12:00'} />
          </div>,
          <div className='col s12'>&nbsp;</div>,
          <Select key={4} s={12} label='Occurrence' icon='timelapse' onChange={this.changeUntilOccurrence.bind(this)}
            defaultValue={untilOccurrence}>
            <option key='first' value='first'>at first occurrence of this moment</option>
            <option key='tomorrow' value='tomorrow'>tomorrow</option>
          </Select>
        ]}

        {waitMode === 'untilQuarter' && (
          <Select key={5} s={12} label='Until next occurrence of' icon='av_timer' onChange={this.changeUntilQuarter.bind(this)}
            defaultValue={untilQuarter}>
            <option key='all' value='00/15/30/45'>any round quarter hour (00/15/30/45)</option>
            <option key='halfs' value='00/30'>any round half hour (00/30)</option>
            <option key='HH:00' value='00'>HH:00</option>
            <option key='HH:15' value='15'>HH:15</option>
            <option key='HH:30' value='30'>HH:30</option>
            <option key='HH:45' value='45'>HH:45</option>
          </Select>
        )}
      </Row>
    )
  }

  changeWaitMode (event) {
    const waitMode = event.currentTarget.value
    this.props.instance.data.waitMode = waitMode
    this.nameChange()
    this.setState({
      waitMode
    })
  }

  changeAmountUnit (event) {
    const amountUnit = event.currentTarget.value
    this.props.instance.data.amountUnit = amountUnit
    this.nameChange()
  }

  changeAmount (value) {
    const amount = parseInt(value[0].split('.')[0])
    this.props.instance.data.amount = amount
    this.nameChange()
  }

  changeUntil (hours, minutes) {
    this.props.instance.data.until = `${hours}:${minutes}`
    this.nameChange()
  }

  changeUntilOccurrence (event) {
    const untilOccurrence = event.currentTarget.value
    this.props.instance.data.untilOccurrence = untilOccurrence
    this.nameChange()
  }

  changeUntilQuarter (event) {
    const untilQuarter = event.currentTarget.value
    this.props.instance.data.untilQuarter = untilQuarter
    this.nameChange()
  }

  nameChange () {
    const data = this.props.instance.data
    switch (data.waitMode) {
      case 'amount':
      default:
        this.props.instance.data.name = `for ${data.amount} ${data.amountUnit}`
        break
      case 'until':
        this.props.instance.data.name = `until ${data.untilOccurrence === 'tomorrow' ? 'tomorrow at' : ''} ${data.until}`
        break
      case 'untilQuarter':
        switch (data.untilQuarter) {
          case '00/15/30/45':
          default:
            this.props.instance.data.name = 'until the next round quarter hour'
            break
          case '00/30':
            this.props.instance.data.name = 'until the next round half hour'
            break
          case '00':
          case '15':
          case '30':
          case '45':
            this.props.instance.data.name = `until the next round quarter (HH:${data.untilQuarter})`
            break
        }
        break
    }
    this.props.highlightCloseButton()
  }
}

BrowserWaitEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserWaitEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserWaitEditForm.label = 'Wait timer'

export default BrowserWaitEditForm
