'use strict'

import React from 'react'

import ItemSettingPanel from '../../item-setting-panel'

class RefreshButtonSettingPanel extends ItemSettingPanel {
  render () {
    return (
      <div>
        RefreshButtonSettingPanel for {this.props.id}

        <button onClick={() => this.close()}>Save and close</button>
      </div>
    )
  }
  // TODO !3: render it for setup of the item.
  // here you have this.close() to save state.props on server, refresh/generate item, and close modal.
}

export default RefreshButtonSettingPanel
