'use strict'

import PropTypes from 'prop-types'
import React from 'react'

import ItemFactoryBuilder from './item-factory-builder'

class ItemSettingPanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      params: { ...props.initialParams },
      item: null // will be set by a ItemLinker instance
    }
  }

  next (ItemClass, params) {
    const { id, save, preferredHeight, preferredWidth, settingPanelCallback, context } = this.props
    const { item } = this.state

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
      .then(() => {
        const itemLinker = new ItemFactoryBuilder.ItemLinker()
        const newItem = <ItemClass id={id} initialParams={params} context={context} ref={(c) => itemLinker.receiveItem(c)} />
        const newSettingPanel = <this.constructor ref={(c) => itemLinker.receiveItemSettingPanel(c)}
          icon={this.props.icon} title={this.props.title}
          id={id} initialParams={params} item={newItem} context={context}
          save={save} settingPanelCallback={settingPanelCallback} />
        return settingPanelCallback({
          id,
          item: newItem,
          preferredHeight,
          preferredWidth,
          settingPanel: newSettingPanel
        })
      })
    }
  }
}

ItemSettingPanel.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  id: PropTypes.string.isRequired,
  item: PropTypes.object,
  initialParams: PropTypes.object,
  save: PropTypes.func.isRequired,
  preferredHeight: PropTypes.number,
  preferredWidth: PropTypes.number,
  settingPanelCallback: PropTypes.func.isRequired, // should be called without args if props.item is not null, else
  // should return a full new structure : { id,item,preferredHeight,preferredWidth,settingPanel(optional) }
  context: PropTypes.object.isRequired
}

ItemSettingPanel.defaultProps = {
  icon: '',
  title: '',
  item: null,
  initialParams: {},
  preferredHeight: 1,
  preferredWidth: 1
}

export default ItemSettingPanel
