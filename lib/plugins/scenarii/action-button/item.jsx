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
      .catch(console.error)
    }
  }

  render () {
    const { mainState, theme } = this.props.context
    const { animationLevel } = mainState()
    const { title = '', icon = 'error', color = 'primary' } = this.state.params
    const { actionExecuting } = this.state

    const btnColor = actionExecuting
        ? theme.feedbacks.progressing
        : (actionExecuting === undefined ? theme.feedbacks.warning : theme.actions[color])

    return (
      <Button waves={animationLevel >= 2 ? 'light' : null}
        className={cx(btnColor, 'truncate fluid')} onClick={this.click.bind(this)}
      >
        {actionExecuting ? (<Icon left className='red-text'>cancel</Icon>) : null}
        <Icon right>{icon}</Icon>
        {actionExecuting ? (<span className='red-text'>Cancel&nbsp;</span>) : ''}{title || (this.state.action && this.state.action.data && this.state.action.data.name)}
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
}

export default ActionButtonItem
