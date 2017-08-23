'use strict'

import React from 'react'

import ItemSettingPanel from '../../item-setting-panel'

class SocketLoggerSettingPanel extends ItemSettingPanel {
  render () {
    return <div>SocketLoggerSettingPanel for {this.props.id}</div>
  }
  // TODO !3: render it for setup of the item
}

export default SocketLoggerSettingPanel
