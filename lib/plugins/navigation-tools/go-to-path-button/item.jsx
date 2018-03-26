'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, Icon } from 'react-materialize'

import { Item } from 'asterism-plugin-library'

class GoToPathButtonItem extends Item {
  render () {
    const { mainState, theme } = this.props.context
    const { animationLevel } = mainState()
    const { title = '', path = '/example/of/another-path', icon = 'link', color = 'secondary' } = this.state.params

    return (
      <Button waves={animationLevel >= 2 ? 'light' : null}
        className={cx(theme.actions[color], 'truncate fluid')} onClick={this.click.bind(this)}
      >
        <Icon right>{icon}</Icon>{title || path}
      </Button>
    )
  }

  click () {
    window.location.pathname = this.state.params.path || '/example/of/another-path'
  }
}

export default GoToPathButtonItem
