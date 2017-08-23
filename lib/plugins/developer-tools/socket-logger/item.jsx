'use strict'

import React from 'react'

import Item from '../../item'

class SocketLoggerItem extends Item {
  render () {
    return <div>RefreshButtonItem for {this.props.id}</div>
  }
}

export default SocketLoggerItem
