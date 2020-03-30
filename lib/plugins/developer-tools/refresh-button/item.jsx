'use strict'

import cx from 'classnames'
import React from 'react'
import { Button, Icon } from 'react-materialize'

import { Item } from 'asterism-plugin-library'

class RefreshButtonItem extends Item {
  render () {
    const { mainState, theme } = this.props.context
    const animationLevel = mainState().animationLevel
    const { title = 'Refresh' } = this.state.params

    return (
      <Button waves={animationLevel >= 2 ? 'light' : null}
        className={cx(theme.actions.edition, 'truncate fluid')} onClick={this.click.bind(this)}
      >
        <Icon left>refresh</Icon>{title}
      </Button>
    )
  }

  click () {
    window.location.reload()
  }

  refresh () {
    return Promise.resolve()
  }
}

export default RefreshButtonItem
