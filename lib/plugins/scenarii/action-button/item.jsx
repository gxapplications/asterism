'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, Icon } from 'react-materialize'
import uuid from 'uuid'

import { Item } from 'asterism-plugin-library'

class ActionButtonItem extends Item {
  constructor (props) {
    super(props)

    this.state.actionExecuting = false // if undefined: maybe still running, but consider not... (timeout preceding)

    this.scenariiService = this.props.context.services['asterism-scenarii']

    this.receiveNewParams(this.state.params)
  }

  receiveNewParams (params) {
    if (params.action) {
      this.scenariiService.getActionInstance(params.action)
      .then((action) => {
        this.setState({ params, action })
      })
      .catch(() => {})
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    const comparator = (i) => [
      i.params.title,
      i.params.color,
      i.params.icon,
      i.params.action,
      i.action && i.action.instanceId,
      i.actionExecuting
    ]
    return JSON.stringify(comparator(this.state)) !== JSON.stringify(comparator(nextState))
  }

  render () {
    const { mainState, theme } = this.props.context
    const { animationLevel } = mainState()
    const { title = '', icon = 'error', color = 'primary' } = this.state.params
    const { actionExecuting, action } = this.state

    const btnColor = !action ? theme.feedbacks.warning : (actionExecuting
        ? theme.feedbacks.progressing
        : (actionExecuting === undefined ? theme.feedbacks.warning : theme.actions[color]))

    return (
      <Button waves={animationLevel >= 2 ? 'light' : null}
        className={cx(btnColor, 'truncate fluid')} onClick={this.click.bind(this)}
      >
        {(!action || actionExecuting) && <Icon left className='red-text'>{!action ? 'healing' : 'cancel'}</Icon>}
        <Icon right>{icon}</Icon>
        {actionExecuting ? (<span className='red-text'>Cancel&nbsp;</span>) : ''}{!action ? 'No action set' : title || (this.state.action && this.state.action.data && this.state.action.data.name)}
      </Button>
    )
  }

  click () {
    if (!this.state.action) {
      return
    }

    // false OR undefined! no === here
    if (this.state.actionExecuting == false) { // eslint-disable-line eqeqeq
      const executionId = uuid.v4()
      this.setState({
        actionExecuting: executionId
      })
      this.scenariiService.executeActionInstance(this.state.action, 86400000, executionId) // 1 day (1000*60*60*24)
      .then(() => {
        this.setState({
          actionExecuting: false
        })
      })
      .catch(() => {
        this.setState({
          actionExecuting: undefined
        })
      })
    } else {
      this.scenariiService.abortActionInstance(this.state.params.action, this.state.actionExecuting)
      .then(() => {
        this.setState({
          actionExecuting: false
        })
      })
      .catch(() => {
        this.setState({
          actionExecuting: undefined
        })
      })
    }
  }

  refresh () {
    if (this.state.actionExecuting === false) {
      return Promise.resolve()
    }
    this.scenariiService.actionExecutionState(this.state.actionExecuting)
    .then((executing) => {
      if (!executing) {
        this.setState({
          actionExecuting: false
        })
      }
    })
  }
}

export default ActionButtonItem
