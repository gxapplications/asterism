'use strict'

import PropTypes from 'prop-types'
import React from 'react'

class ItemSettingPanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      params: { ...props.initialParams }
    }
  }

  close () {
    const { id, item, save, preferredHeight, preferredWidth, settingPanelCallback } = this.props
    const { params } = this.state
    if (item) {
      // it's an item update, return nothing but update item here
      save(params)
      .then(() => {
        if (item.receiveNewParams) {
          item.receiveNewParams(params)
        }
        settingPanelCallback()
      })
    } else {
      // it's a new item creation, return the full structure
      save(params)
      .then(() => settingPanelCallback({
        id,
        item,
        preferredHeight,
        preferredWidth,
        settingPanel: this.constructor(this.props)
      }))
    }
  }
}

ItemSettingPanel.propTypes = {
  id: PropTypes.string.isRequired,
  item: PropTypes.object,
  initialParams: PropTypes.object,
  save: PropTypes.func.isRequired,
  preferredHeight: PropTypes.number,
  preferredWidth: PropTypes.number,
  settingPanelCallback: PropTypes.func.isRequired // should be called without args if props.item is not null, else
  // should return a full new structure : { id,item,preferredHeight,preferredWidth,settingPanel(optional) }
}

ItemSettingPanel.defaultProps = {
  item: null,
  initialParams: {},
  preferredHeight: 1,
  preferredWidth: 1
}

export default ItemSettingPanel
