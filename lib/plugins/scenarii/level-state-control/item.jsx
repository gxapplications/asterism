'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, Icon } from 'react-materialize'

import { Item } from 'asterism-plugin-library'

// TODO !0: item
class LevelStateControlItem extends Item {
  constructor (props) {
    super(props)

    this.scenariiService = this.props.context.services['asterism-scenarii']
  }

  componentDidMount () {
    if (this.state.params.levelState) {
      this.scenariiService.getStateInstance(this.state.params.levelState)
        .then((levelState) => {
          this.setState({ levelState })
        })
    }

    // TODO !0: add a listener, when state change from server, must update here!
  }

  render () {
    const { mainState, theme } = this.props.context
    const { animationLevel } = mainState()
    const { title = '', icon = 'error', color = 'primary' } = this.state.params
    const { levelState } = this.state

    const btnMoreColor = (levelState) ? `${levelState.data.colors[levelState.data.state]}-text` : 'white-text'
    const btnLessColor = (levelState) ? `${levelState.data.colors[levelState.data.state - 2]}-text` : 'white-text'
    const stateColor = (levelState) ? levelState.data.colors[levelState.data.state - 1] : 'black'

    // TODO !0: disable btn if limit reached x2
    return levelState ? (
      <div className={cx(stateColor, 'fluid levelStateItem')}>
        <Button waves={animationLevel >= 2 ? 'light' : null}
          className={cx(theme.actions[color], 'truncate')} onClick={this.click.bind(this)}>
          <Icon className={btnMoreColor}>keyboard_arrow_up</Icon>
        </Button>

        <div>
          <span><Icon>{icon}</Icon> {title || 'TODO'}</span>
        </div>

        <Button waves={animationLevel >= 2 ? 'light' : null}
          className={cx(theme.actions[color], 'truncate')} onClick={this.click.bind(this)}>
          <Icon className={btnLessColor}>keyboard_arrow_down</Icon>
        </Button>
      </div>
    ) : (
      <div />
    )
  }

  click () {

  }
}

export default LevelStateControlItem
