'use strict'

/* global $, noUiSlider, wNumb */
import PropTypes from 'prop-types'
import React from 'react'
import { Row, Checkbox, Select, TimePicker } from 'react-materialize'
import uuid from 'uuid'

const minuter = (minutes) => {
  return `${Math.floor(minutes / 60)}:${(minutes % 60) || '00'}`
}

class BrowserTimeBasedConditionEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']

    this.state = {
      dayMode: props.instance.data.dayMode || 'everyday',
      timeMode: props.instance.data.timeMode || 'hourMinute',
      dayInMonth: props.instance.data.dayInMonth || [1],
      dayAndMonth: props.instance.data.dayAndMonth || [32],
      weekdayInMonth: props.instance.data.weekdayInMonth || [[1, 1]],
      timeBetweens: props.instance.data.timeBetweens || [],
      timeBeforeAfter: props.instance.data.timeBeforeAfter || '12:00'
    }

    this._slider = []
    this._formId = `time-based-condition-panel-${uuid.v4()}`
  }

  componentDidMount () {
    this.plugWidgets()
  }

  componentDidUpdate () {
    this.plugWidgets()
  }

  plugWidgets () {
    this.state.timeBetweens.forEach((timeBetween, idx) => {
      const domSlider = $(`#between-slider-${this.props.instance.instanceId}-${idx}`)[0]
      if (!domSlider) {
        return
      }

      if (!this._slider[idx] || !domSlider.noUiSlider) {
        this._slider[idx] = noUiSlider.create(domSlider, {
          start: [timeBetween[0], timeBetween[1]],
          connect: true,
          step: 1,
          animate: true,
          range: {
            min: [0, 10],
            max: [1440]
          },
          format: wNumb({ decimals: 1, edit: minuter }),
          pips: { // Show a scale with the slider
            mode: 'positions',
            values: [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100],
            density: 4,
            stepped: true,
            format: wNumb({ decimals: 1, edit: minuter })
          },
          tooltips: [
            wNumb({ decimals: 1, edit: minuter }),
            wNumb({ decimals: 1, edit: minuter })
          ],
          behaviour: 'tap-drag',
          orientation: 'horizontal'
        })

        this._slider[idx].on('change', this.setBetweenSlider.bind(this, idx))
      } else {
        this._slider[idx].set([timeBetween[0], timeBetween[1]])
      }
    })

    const domSliderA = $(`#between-slider-${this.props.instance.instanceId}-a`)[0]
    if (!domSliderA) {
      return
    }

    if (!this._sliderA || !domSliderA.noUiSlider) {
      this._sliderA = noUiSlider.create(domSliderA, {
        start: [0, 1440],
        connect: true,
        step: 1,
        animate: true,
        range: {
          min: [0, 10],
          max: [1440]
        },
        format: wNumb({ decimals: 1, edit: minuter }),
        pips: { // Show a scale with the slider
          mode: 'positions',
          values: [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100],
          density: 4,
          stepped: true,
          format: wNumb({ decimals: 1, edit: minuter })
        },
        tooltips: [
          wNumb({ decimals: 1, edit: minuter }),
          wNumb({ decimals: 1, edit: minuter })
        ],
        behaviour: 'tap-drag',
        orientation: 'horizontal'
      })

      this._sliderA.on('change', this.addBetweenSlider.bind(this))
    } else {
      this._sliderA.set([0, 1440])
    }
  }

  renderDayAndMonthSelectors (dayAndMonth) {
    const list = dayAndMonth.map((dm, j) => {
      const d = (dm % 32) + 1
      const m = dm >> 5
      return (
        <div key={`190-${j}`} className='col s12 m6 l4'>
          <Select key={`19-${j}`} s={6} label='Day' icon='today' onChange={this.changeDayAndMonth.bind(this, j, 0)} defaultValue={d}>
            <option key={`19-${j}-d`} value=''>Remove</option>
            {(new Array(31).fill(null)).map((o, i) =>
              <option key={`19-${j}-${i}`} value={i + 1}>{i + 1}</option>
            )}
          </Select>
          <Select key={`20-${j}`} s={6} label='Month' onChange={this.changeDayAndMonth.bind(this, j, 1)} defaultValue={m}>
            {(new Array(12).fill(null)).map((o, i) =>
              <option key={`20-${j}-${i}`} value={i + 1}>{i + 1}</option>
            )}
          </Select>
        </div>
      )
    })
    if (list.length < 32) {
      list.push(
        <div key={192} className='col s12 m6 l4 translucent-text'>
          <Select key={`19-${dayAndMonth.length}`} s={6} label='Day' icon='today' onChange={this.changeDayAndMonth.bind(this, dayAndMonth.length, 0)} defaultValue=''>
            <option key={`19-${dayAndMonth.length}-a`} value=''>Add</option>
            {(new Array(31).fill(null)).map((o, i) =>
              <option key={`19-${dayAndMonth.length}-${i}`} value={i + 1}>{i + 1}</option>
            )}
          </Select>
          <Select key={`20-${dayAndMonth.length}`} s={6} label='Month' onChange={this.changeDayAndMonth.bind(this, dayAndMonth.length, 1)} defaultValue={1}>
            {(new Array(12).fill(null)).map((o, i) =>
              <option key={`20-${dayAndMonth.length}-${i}`} value={i + 1}>{i + 1}</option>
            )}
          </Select>
        </div>
      )
    }

    if (dayAndMonth.includes(92)) { // 29th feb
      list.push(
        <div key={21} className='col s12'>If there is no 29th february in the year, will accept 1st march instead.</div>
      )
    }

    return list
  }

  renderWeekdayInMonthSelectors (weekdayInMonth) {
    const list = weekdayInMonth.map(([o, d], j) =>
      <div key={`31-${uuid.v4()}`} className='col s12 l6'>
        <Select key={`31-${j}-o`} s={6} label='Occurrence' icon='today' onChange={this.changeWeekdayInMonth.bind(this, j, 0)} defaultValue={o}>
          <option key={`31-${j}-o-d`} value=''>Remove</option>
          <option key={`31-${j}-o-1`} value={1}>First</option>
          <option key={`31-${j}-o-2`} value={2}>Second</option>
          <option key={`31-${j}-o-3`} value={3}>Third</option>
          <option key={`31-${j}-o-4`} value={4}>Fourth</option>
          <option key={`31-${j}-o-8`} value={8}>Penultimate</option>
          <option key={`31-${j}-o-9`} value={9}>Last</option>
        </Select>
        <Select key={`31-${j}-d`} s={6} label='Day' onChange={this.changeWeekdayInMonth.bind(this, j, 1)} defaultValue={d}>
          <option key={`31-${j}-d-0`} value={0}>Sunday</option>
          <option key={`31-${j}-d-1`} value={1}>Monday</option>
          <option key={`31-${j}-d-2`} value={2}>Tuesday</option>
          <option key={`31-${j}-d-3`} value={3}>Wednesday</option>
          <option key={`31-${j}-d-4`} value={4}>Thursday</option>
          <option key={`31-${j}-d-5`} value={5}>Friday</option>
          <option key={`31-${j}-d-6`} value={6}>Saturday</option>
        </Select>
      </div>
    )

    if (list.length < 32) {
      list.push(
        <div key={`31-${weekdayInMonth.length}`} className='col s12 l6 translucent-text'>
          <Select
            key={`31-${weekdayInMonth.length}-o`} s={6} label='Occurrence' icon='today'
            onChange={this.changeWeekdayInMonth.bind(this, weekdayInMonth.length, 0)} defaultValue=''
          >
            <option key={`31-${weekdayInMonth.length}-o-a`} value=''>Add</option>
            <option key={`31-${weekdayInMonth.length}-o-1`} value={1}>First</option>
            <option key={`31-${weekdayInMonth.length}-o-2`} value={2}>Second</option>
            <option key={`31-${weekdayInMonth.length}-o-3`} value={3}>Third</option>
            <option key={`31-${weekdayInMonth.length}-o-4`} value={4}>Fourth</option>
            <option key={`31-${weekdayInMonth.length}-o-8`} value={8}>Penultimate</option>
            <option key={`31-${weekdayInMonth.length}-o-9`} value={9}>Last</option>
          </Select>
          <Select
            key={`31-${weekdayInMonth.length}-d`} s={6} label='Day'
            onChange={this.changeWeekdayInMonth.bind(this, weekdayInMonth.length, 1)} defaultValue={1}
          >
            <option key={`31-${weekdayInMonth.length}-d-0`} value={0}>Sunday</option>
            <option key={`31-${weekdayInMonth.length}-d-1`} value={1}>Monday</option>
            <option key={`31-${weekdayInMonth.length}-d-2`} value={2}>Tuesday</option>
            <option key={`31-${weekdayInMonth.length}-d-3`} value={3}>Wednesday</option>
            <option key={`31-${weekdayInMonth.length}-d-4`} value={4}>Thursday</option>
            <option key={`31-${weekdayInMonth.length}-d-5`} value={5}>Friday</option>
            <option key={`31-${weekdayInMonth.length}-d-6`} value={6}>Saturday</option>
          </Select>
        </div>
      )
    }

    return list
  }

  render () {
    const { instance } = this.props
    const { dayMode, timeMode, weekdays, dayInMonth, dayAndMonth, weekdayInMonth, timeBetweens, timeBeforeAfter } = instance.data
    const timePickerId = uuid.v4()

    return (
      <Row className='section card form time-based-condition-panel' id={this._formId}>
        <br />
        <Select key={0} s={12} label='Day / Date' icon='calendar_today' onChange={this.changeDayMode.bind(this)} defaultValue={dayMode}>
          <option key='whatever' value='whatever'>Whatever the date</option>
          <option key='weekdays' value='weekdays'>Based on week days</option>
          <option key='dayInMonth' value='dayInMonth'>Based on days # each month</option>
          <option key='dayAndMonth' value='dayAndMonth'>Same dates each year</option>
          <option key='weekdayInMonth' value='weekdayInMonth'>Based on the nth weekday of the month</option>
        </Select>

        {dayMode === 'weekdays' && [
          <Checkbox key={10} value='0' label='Sunday' className='filled-in checkbox-spaced' checked={weekdays.includes(0)} onChange={this.changeWeekdays.bind(this)} />,
          <Checkbox key={11} value='1' label='Monday' className='filled-in checkbox-spaced' checked={weekdays.includes(1)} onChange={this.changeWeekdays.bind(this)} />,
          <Checkbox key={12} value='2' label='Tuesday' className='filled-in checkbox-spaced' checked={weekdays.includes(2)} onChange={this.changeWeekdays.bind(this)} />,
          <Checkbox key={13} value='3' label='Wednesday' className='filled-in checkbox-spaced' checked={weekdays.includes(3)} onChange={this.changeWeekdays.bind(this)} />,
          <Checkbox key={14} value='4' label='Thursday' className='filled-in checkbox-spaced' checked={weekdays.includes(4)} onChange={this.changeWeekdays.bind(this)} />,
          <Checkbox key={15} value='5' label='Friday' className='filled-in checkbox-spaced' checked={weekdays.includes(5)} onChange={this.changeWeekdays.bind(this)} />,
          <Checkbox key={16} value='6' label='Saturday' className='filled-in checkbox-spaced' checked={weekdays.includes(6)} onChange={this.changeWeekdays.bind(this)} />
        ]}

        {(dayMode === 'dayInMonth' || dayMode === 'dayAndMonth' || dayMode === 'weekdayInMonth') && <div className='col s12'>&nbsp;</div>}

        {dayMode === 'dayInMonth' && [
          dayInMonth.map((d, j) =>
            <Select key={`17-${j}`} s={6} m={4} l={3} label='Day number' icon='today' onChange={this.changeDayInMonth.bind(this, j)} defaultValue={d}>
              <option key={`17-${j}-d`} value=''>Remove</option>
              {(new Array(31).fill(null)).map((o, i) =>
                <option key={`17-${j}-${i}`} value={i + 1}>{i + 1}</option>
              )}
            </Select>
          ),
          dayInMonth.length < 32 ? (
            <Select key={`17-${dayInMonth.length}`} className='translucent-text' s={6} m={4} l={3} label='Day number' icon='today' onChange={this.changeDayInMonth.bind(this, dayInMonth.length)}>
              <option key={`17-${dayInMonth.length}-a`} value=''>Add</option>
              {(new Array(31).fill(null)).map((o, i) =>
                <option key={`17-${dayInMonth.length}-${i}`} value={i + 1}>{i + 1}</option>
              )}
            </Select>
          ) : null,
          dayInMonth.includes(29) || dayInMonth.includes(30) || dayInMonth.includes(31)
            ? <div key={18} className='col s12'>If day number does not exist in a month then no trigger will occurs during this month.</div>
            : null
        ]}

        {dayMode === 'dayAndMonth' && this.renderDayAndMonthSelectors(dayAndMonth)}

        {dayMode === 'weekdayInMonth' && this.renderWeekdayInMonthSelectors(weekdayInMonth)}

        {dayMode !== 'whatever' && [
          <div key={4} className='col s12'>&nbsp;</div>,
          <hr key={5} className='col s12' />
        ]}

        <div key={6} className='col s12'>&nbsp;</div>
        <Select
          key={7} s={12} label='Time' icon='schedule' onChange={this.changeTimeMode.bind(this)}
          defaultValue={timeMode}
        >
          <option key='whatever' value='whatever'>Whatever the time</option>
          <option key='between' value='between'>Between time laps</option>
          <option key='before' value='before'>Before specific hour</option>
          <option key='after' value='after'>After specific hour</option>
        </Select>

        {timeMode === 'between' && [
          timeBetweens.map((between, i) => (
            <div className='col s12 slider' key={`8-${i}`}>
              <div id={`between-slider-${instance.instanceId}-${i}`} />
            </div>
          )),
          timeBetweens.length < 32 ? (
            <div className='col s12 slider' key='8-a'>
              <div id={`between-slider-${instance.instanceId}-a`} className='grey-knobs' />
            </div>
          ) : null
        ]}

        {timeMode === 'before' && [
          <div key={9} className='input-field col s12 m8 l6'>
            <label className='col s5' htmlFor={timePickerId}>Before time:</label>
            <TimePicker
              className='col offset-s5 s7' id={timePickerId} options={{
                twelveHour: false,
                autoClose: true,
                defaultTime: timeBeforeAfter || '12:00',
                showClearBtn: false
              }} onChange={this.changeBeforeAfterTime.bind(this)} value={timeBeforeAfter || '12:00'}
            />
          </div>
        ]}

        {timeMode === 'after' && [
          <div key={10} className='input-field col s12 m6 l4'>
            <label className='col s5' htmlFor={timePickerId}>After time:</label>
            <TimePicker
              className='col offset-s5 s7' id={timePickerId} options={{
                twelveHour: false,
                autoClose: true,
                defaultTime: timeBeforeAfter || '12:00',
                showClearBtn: false
              }} onChange={this.changeBeforeAfterTime.bind(this)} value={timeBeforeAfter || '12:00'}
            />
          </div>
        ]}
      </Row>
    )
  }

  changeDayMode (event) {
    const dayMode = event.currentTarget.value
    this.props.instance.data.dayMode = dayMode
    this.nameChange()
    this.setState({
      dayMode
    })
  }

  changeTimeMode (event) {
    const timeMode = event.currentTarget.value
    this.props.instance.data.timeMode = timeMode
    this.nameChange()
    this.setState({
      timeMode
    })
  }

  changeWeekdays () {
    const weekdays = $(`#${this._formId} input[type="checkbox"]`).map((i, e) => e.checked ? i : false).toArray().filter(v => v !== false)
    this.props.instance.data.weekdays = weekdays
    this.nameChange()
  }

  changeDayInMonth (index, event) {
    const value = parseInt(event.currentTarget.value, 10)
    if (event.currentTarget.value === '') {
      this.props.instance.data.dayInMonth = this.props.instance.data.dayInMonth.filter((v, i) => i !== index)

      if (this.props.instance.data.dayInMonth.length === 0) {
        this.props.instance.data.dayInMonth = [1]
      }

      this.props.instance.data.dayInMonth = [...new Set(this.props.instance.data.dayInMonth)] // dedup
      this.nameChange()
      return this.setState({
        dayInMonth: this.props.instance.data.dayInMonth
      })
    }

    if (this.props.instance.data.dayInMonth.includes(value)) {
      event.currentTarget.value = ''
    }
    this.props.instance.data.dayInMonth[index] = value
    this.props.instance.data.dayInMonth = [...new Set(this.props.instance.data.dayInMonth)] // dedup
    this.nameChange()
    return this.setState({
      dayInMonth: this.props.instance.data.dayInMonth
    })
  }

  changeDayAndMonth (index, dayOrMonth, event) {
    return (dayOrMonth === 1) ? this.changeDayAndMonthMonth(index, event) : this.changeDayAndMonthDay(index, event)
  }

  changeDayAndMonthDay (index, event) {
    const d = parseInt(event.currentTarget.value, 10)
    const m = (this.props.instance.data.dayAndMonth[index] || 32) >> 5 // 32=(1 << 5) -> january by default
    let dm = (m << 5) + (d - 1)

    if (event.currentTarget.value === '') {
      this.props.instance.data.dayAndMonth = this.props.instance.data.dayAndMonth.filter((v, i) => i !== index)

      if (this.props.instance.data.dayAndMonth.length === 0) {
        this.props.instance.data.dayAndMonth = [32] // 1st january
      }

      this.props.instance.data.dayAndMonth = [...new Set(this.props.instance.data.dayAndMonth)] // dedup

      this.nameChange()
      return this.setState({
        dayAndMonth: this.props.instance.data.dayAndMonth
      })
    }

    if (this.props.instance.data.dayAndMonth.includes(dm)) {
      event.currentTarget.value = ''
    }

    while ([93, 94, 158, 222, 318, 382].includes(dm)) {
      dm--
    }

    this.props.instance.data.dayAndMonth[index] = dm
    this.props.instance.data.dayAndMonth = [...new Set(this.props.instance.data.dayAndMonth)] // dedup

    this.nameChange()
    return this.setState({
      dayAndMonth: this.props.instance.data.dayAndMonth
    })
  }

  changeDayAndMonthMonth (index, event) {
    const m = parseInt(event.currentTarget.value, 10)
    const d = ((this.props.instance.data.dayAndMonth[index] || 0) % 32) + 1 // first day of month by default
    let dm = (m << 5) + (d - 1)

    while ([93, 94, 158, 222, 318, 382].includes(dm)) {
      dm--
    }

    this.props.instance.data.dayAndMonth[index] = dm
    this.props.instance.data.dayAndMonth = [...new Set(this.props.instance.data.dayAndMonth)] // dedup

    this.nameChange()
    return this.setState({
      dayAndMonth: this.props.instance.data.dayAndMonth
    })
  }

  changeWeekdayInMonth (index, occurrenceOrDay, event) {
    const value = parseInt(event.currentTarget.value, 10)

    if (occurrenceOrDay === 0) { // occurrence
      if (event.currentTarget.value === '') {
        this.props.instance.data.weekdayInMonth = this.props.instance.data.weekdayInMonth.filter((v, i) => i !== index)
        if (this.props.instance.data.weekdayInMonth.length === 0) {
          this.props.instance.data.weekdayInMonth = [[1, 1]] // 1st monday of the month
        }
      } else {
        this.props.instance.data.weekdayInMonth[index] = this.props.instance.data.weekdayInMonth[index] || [1, 1]
        this.props.instance.data.weekdayInMonth[index][0] = value
      }
    } else if (occurrenceOrDay === 1) { // day of the week
      this.props.instance.data.weekdayInMonth[index] = this.props.instance.data.weekdayInMonth[index] || [1, 1]
      this.props.instance.data.weekdayInMonth[index][1] = value
    }

    this.props.instance.data.weekdayInMonth = [...new Set(this.props.instance.data.weekdayInMonth)] // dedup

    this.nameChange()
    return this.setState({
      weekdayInMonth: this.props.instance.data.weekdayInMonth
    })
  }

  addBetweenSlider (values) {
    let start = values[0].split(':')
    start = (parseInt(start[0]) * 60) + parseInt(start[1])
    let end = values[1].split(':')
    end = (parseInt(end[0]) * 60) + parseInt(end[1])

    if (start === end || (start === 0 && end === 1440)) {
      return this.plugWidgets()
    }

    this.props.instance.data.timeBetweens.push([start, end])
    this.nameChange()
    this.setState({
      timeBetweens: this.props.instance.data.timeBetweens
    })
  }

  setBetweenSlider (idx, values) {
    let start = values[0].split(':')
    start = (parseInt(start[0]) * 60) + parseInt(start[1])
    let end = values[1].split(':')
    end = (parseInt(end[0]) * 60) + parseInt(end[1])

    if (start === end || (start === 0 && end === 1440)) {
      this.props.instance.data.timeBetweens.splice(idx, 1)
    } else {
      this.props.instance.data.timeBetweens[idx] = [start, end]
    }

    this.nameChange()
    this.setState({
      timeBetweens: this.props.instance.data.timeBetweens
    })
  }

  changeBeforeAfterTime (hours, minutes) {
    this.props.instance.data.timeBeforeAfter = `${hours}:${minutes}`
    this.nameChange()
    return this.setState({
      timeBeforeAfter: this.props.instance.data.timeBeforeAfter
    })
  }

  nameChange () {
    const data = this.props.instance.data
    let name = ''
    switch (data.dayMode) {
      case 'whatever':
        name = 'Whatever the day'
        break

      case 'weekdays': {
        if (data.weekdays.length === 0) {
          this.props.instance.data.name = 'Misconfigured time based condition'
          return
        }
        const weekdays = data.weekdays
          .map((i) => ['sun', 'mon', 'tues', 'wed', 'thur', 'fri', 'sat'][i])
        if (data.weekdays.length === 1) {
          name = `On ${weekdays[0]}`
          break
        }
        name = weekdays.join(', ')
        if (name.length > 17) {
          name = `${name.substr(0, 14)}...`
        }
        name = `On [${name}]`
        break
      }

      case 'dayInMonth': {
        const days = data.dayInMonth.sort((a, b) => a - b).map((d) => {
          switch (d) {
            case 1:
              return '1st'
            case 2:
              return '2nd'
            case 3:
              return '3rd'
            default:
              return `${d}th`
          }
        })
        if (days.length === 1) {
          name = `On the ${days[0]} of the month`
          break
        }
        name = days.join(', ')
        if (name.length > 17) {
          name = `${name.substr(0, 14)}...`
        }
        name = `On the [${name}] of the month`
        break
      }

      case 'dayAndMonth': {
        const dates = data.dayAndMonth.sort((a, b) => a - b).map((dm) => `${dm >> 5}/${(dm % 32) + 1}`)
        if (dates.length === 1) {
          name = `On date ${dates[0]}`
          break
        }
        name = dates.join(', ')
        if (name.length > 17) {
          name = `${name.substr(0, 14)}...`
        }
        name = `On dates [${name}]`
        break
      }

      case 'weekdayInMonth': {
        const dates2 = data.weekdayInMonth.map(([occurrence, weekday]) => {
          const occurrenceText = [0, 'First', 'Second', 'Third', 'Fourth', 0, 0, 0, 'Penultimate', 'Last'][occurrence]
          const weekDayText = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][weekday]
          return `${occurrenceText} ${weekDayText}`
        })
        if (dates2.length === 1) {
          name = `On ${dates2[0]} of the month`
          break
        }
        name = dates2.join(', ')
        if (name.length > 25) {
          name = `${name.substr(0, 21)}...`
        }
        name = `On [${name}] of the month`
        break
      }
    }

    switch (data.timeMode) {
      case 'between': {
        let laps = data.timeBetweens.map((between) => `${minuter(between[0])}→${minuter(between[1])}`)
        if (laps.length === 1) {
          name += ` on the ${laps[0]} time slot`
          break
        }
        laps = laps.join(', ')
        if (laps.length > 25) {
          laps = `${laps.substr(0, 21)}...`
        }
        name += ` on specific time slots [${laps}]`
        break
      }

      case 'before':
        name += ` before ${data.timeBeforeAfter}`
        break

      case 'after':
        name += ` after ${data.timeBeforeAfter}`
        break

      case 'whatever':
      default:
        // nothing to tell
        break
    }

    this.props.instance.data.name = name
    this.props.highlightCloseButton()
  }
}

BrowserTimeBasedConditionEditForm.propTypes = {
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserTimeBasedConditionEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserTimeBasedConditionEditForm.label = 'Time based condition'

export default BrowserTimeBasedConditionEditForm
