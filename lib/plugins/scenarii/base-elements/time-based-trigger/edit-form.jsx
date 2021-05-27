/* eslint-disable no-case-declarations */
'use strict'

/* global $ */
import PropTypes from 'prop-types'
import React from 'react'
import { Button, Icon, Row, Checkbox, Select, TimePicker } from 'react-materialize'
import uuid from 'uuid'

class BrowserTimeBasedTriggerEditForm extends React.Component {
  constructor (props) {
    super(props)
    this.scenariiService = props.services()['asterism-scenarii']

    this.state = {
      dayMode: props.instance.data.dayMode || 'everyday',
      timeMode: props.instance.data.timeMode || 'hourMinute',
      dayInMonth: props.instance.data.dayInMonth || [1],
      dayAndMonth: props.instance.data.dayAndMonth || [32],
      hourMinute: props.instance.data.hourMinute || ['12:00'],
      weekdayInMonth: props.instance.data.weekdayInMonth || [[1, 1]]
    }

    this._formId = `time-based-trigger-panel-${uuid.v4()}`
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
        <div key={21} className='col s12'>If there is no 29th february in the year, will trigger on 1st march instead.</div>
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
            key={`31-${weekdayInMonth.length}-d`} s={6} label='Day' type='select'
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
    const { dayMode, timeMode, weekdays, dayInMonth, dayAndMonth, hourMinute, weekdayInMonth } = instance.data
    const timePickerId = uuid.v4()

    return (
      <Row className='section card form time-based-trigger-panel' id={this._formId}>
        <h6 className='show-in-procedure'>{instance.shortLabel}</h6>
        <br />
        <Select key={0} s={12} label='Day / Date' icon='calendar_today' onChange={this.changeDayMode.bind(this)} defaultValue={dayMode}>
          <option key='everyday' value='everyday'>Every day</option>
          <option key='weekdays' value='weekdays'>Based on week days</option>
          <option key='dayInMonth' value='dayInMonth'>Based on days # each month</option>
          <option key='dayAndMonth' value='dayAndMonth'>Same dates each year</option>
          <option key='weekdayInMonth' value='weekdayInMonth'>Based on the nth weekday of the month</option>
        </Select>
        <div className='col s12'>&nbsp;</div>

        {dayMode === 'weekdays' && [
          <Checkbox key={10} value='0' label='Sunday' className='filled-in weekdays' checked={weekdays.includes(0)} onChange={this.changeWeekdays.bind(this)} />,
          <Checkbox key={11} value='1' label='Monday' className='filled-in weekdays' checked={weekdays.includes(1)} onChange={this.changeWeekdays.bind(this)} />,
          <Checkbox key={12} value='2' label='Tuesday' className='filled-in weekdays' checked={weekdays.includes(2)} onChange={this.changeWeekdays.bind(this)} />,
          <Checkbox key={13} value='3' label='Wednesday' className='filled-in weekdays' checked={weekdays.includes(3)} onChange={this.changeWeekdays.bind(this)} />,
          <Checkbox key={14} value='4' label='Thursday' className='filled-in weekdays' checked={weekdays.includes(4)} onChange={this.changeWeekdays.bind(this)} />,
          <Checkbox key={15} value='5' label='Friday' className='filled-in weekdays' checked={weekdays.includes(5)} onChange={this.changeWeekdays.bind(this)} />,
          <Checkbox key={16} value='6' label='Saturday' className='filled-in weekdays' checked={weekdays.includes(6)} onChange={this.changeWeekdays.bind(this)} />
        ]}

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

        {dayMode !== 'everyday' && [
          <div key={4} className='col s12'>&nbsp;</div>,
          <hr key={5} className='col s12' />
        ]}

        <div key={6} className='col s12'>&nbsp;</div>
        <Select
          key={7} s={12} label='Time / Frequency' icon='schedule' onChange={this.changeTimeMode.bind(this)}
          defaultValue={timeMode}
        >
          <option key='hourMinute' value='hourMinute'>Specific time in the day</option>
          <option key='eachQuarter' value='eachQuarter'>Each round quarter hour (00/15/30/45)</option>
          <option key='eachHalf' value='eachHalf'>Each round half hour (00/30)</option>
          <option key='eachHour' value='eachHour'>Each round hour (HH:00)</option>
        </Select>

        {timeMode === 'hourMinute' && [
          ...hourMinute.map((hm, j) =>
            <div key={`81-${j}`} className='input-field col s12 m6 l6 time-based-trigger-center-aligned'>
              <div className='col s4'><Icon left>schedule</Icon>Time:</div>
              <TimePicker
                s={4} id={`${timePickerId}-${j}`} options={{
                  twelveHour: false,
                  autoClose: true,
                  defaultTime: hm || '12:00',
                  showClearBtn: false
                }} onChange={this.changeHourMinute.bind(this, j)} value={hm || '12:00'}
              />
              <Button small s={4} onClick={this.changeHourMinute.bind(this, j, undefined, undefined)}>Remove</Button>
            </div>
          ),
          (hourMinute.length < 32) && (
            <div className='col s12 m6 l6 time-based-trigger-center-aligned'>
              <Button
                key={`81-${hourMinute.length}-a`} small
                className='col s6 m4 l3 offset-s3' onClick={this.changeHourMinute.bind(this, hourMinute.length, 12, 0)}
              >
                Add
              </Button>
            </div>
          )
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
    const weekdays = $(`#${this._formId} input.weekdays`).map((i, e) => e.checked ? i : false).toArray().filter(v => v !== false)
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

  changeHourMinute (index, hours, minutes) {
    if (hours !== undefined && minutes !== undefined) {
      hours = `${hours}`.padStart(2, '0')
      minutes = `${minutes}`.padStart(2, '0')
      this.props.instance.data.hourMinute[index] = `${hours}:${minutes}`
    } else {
      this.props.instance.data.hourMinute = this.props.instance.data.hourMinute.filter((v, i) => i !== index)
      if (this.props.instance.data.hourMinute.length === 0) {
        this.props.instance.data.hourMinute = ['12:00']
      }
    }
    this.nameChange()
    return this.setState({
      hourMinute: this.props.instance.data.hourMinute
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

  nameChange () {
    const data = this.props.instance.data
    let name = ''
    switch (data.dayMode) {
      case 'everyday':
        name = 'Every day'
        break

      case 'weekdays':
        if (data.weekdays.length === 0) {
          this.props.instance.data.name = 'Misconfigured time based trigger'
          return
        }
        const weekdays = data.weekdays
          .map((i) => ['sun', 'mon', 'tues', 'wed', 'thur', 'fri', 'sat'][i])
        if (data.weekdays.length === 1) {
          name = `Each ${weekdays[0]}`
          break
        }
        name = weekdays.join(', ')
        if (name.length > 17) {
          name = `${name.substr(0, 14)}...`
        }
        name = `Each [${name}]`
        break

      case 'dayInMonth':
        const days = data.dayInMonth.sort((a, b) => a - b)
        if (days.length === 1) {
          name = `Each day #${days[0]} of each month`
          break
        }
        name = days.join(', ')
        if (name.length > 17) {
          name = `${name.substr(0, 14)}...`
        }
        name = `Each days #[${name}] of each month`
        break

      case 'dayAndMonth':
        const dates = data.dayAndMonth.sort((a, b) => a - b).map((dm) => `${dm >> 5}/${(dm % 32) + 1}`)
        if (dates.length === 1) {
          name = `Each date ${dates[0]}`
          break
        }
        name = dates.join(', ')
        if (name.length > 17) {
          name = `${name.substr(0, 14)}...`
        }
        name = `Each dates [${name}]`
        break

      case 'weekdayInMonth':
        const dates2 = data.weekdayInMonth.map(([occurrence, weekday]) => {
          const occurrenceText = [0, 'First', 'Second', 'Third', 'Fourth', 0, 0, 0, 'Penultimate', 'Last'][occurrence]
          const weekDayText = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][weekday]
          return `${occurrenceText} ${weekDayText}`
        })
        if (dates2.length === 1) {
          name = `Each ${dates2[0]}`
          break
        }
        name = dates2.join(', ')
        if (name.length > 25) {
          name = `${name.substr(0, 21)}...`
        }
        name = `Each [${name}]`
        break
    }

    switch (data.timeMode) {
      case 'hourMinute':
        let times = [...data.hourMinute].sort().join(', ')
        if (data.hourMinute.length === 1) {
          name += ` at ${times}`
          break
        }
        if (times.length > 17) {
          times = `${times.substr(0, 14)}...`
        }
        name += ` at [${times}]`
        break

      case 'eachQuarter':
        name += ' at each quarter hour'
        break

      case 'eachHalf':
        name += ' at each half hour'
        break

      case 'eachHour':
        name += ' at each round hour'
        break
    }

    this.props.instance.data.name = name
    this.props.highlightCloseButton()
  }
}

BrowserTimeBasedTriggerEditForm.propTypes = {
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

BrowserTimeBasedTriggerEditForm.defaultProps = {
  highlightCloseButton: () => {}
}

BrowserTimeBasedTriggerEditForm.label = 'Time based trigger'

export default BrowserTimeBasedTriggerEditForm
