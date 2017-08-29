'use strict'

import React from 'react'

import Item from '../../item'

class SocketLoggerItem extends Item {
  render () {
    return (
      <div className='truncate fluid'>
        SocketLoggerItem for {this.props.id}
      </div>
    )
    // TODO !3: render logs: log messages from sockets (and others ? from server ? can catch browser console messages ?)
  }
}

export default SocketLoggerItem
