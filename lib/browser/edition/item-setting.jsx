'use strict'

/* global $ */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon } from 'react-materialize'

class ItemSetting extends React.Component {
  componentDidMount () {
    const { animationLevel } = this.props
    $('#item-setting-modal').modal({
      dismissible: false,
      opacity: 0.5,
      inDuration: animationLevel >= 2 ? 300 : 0,
      outDuration: animationLevel >= 2 ? 300 : 0,
      endingTop: '10%'
    })
  }

  render () {
    const { icon, title, theme, children, animationLevel } = this.props
    return (
      <div id='item-setting-modal' className={cx('modal', theme.backgrounds.body)}>
        <div className='modal-content'>
          <div className={cx('coloring-header', animationLevel < 3 ? theme.backgrounds.editing : null)}>
            <div>
              <h4>
                <Icon small>{icon || 'settings'}</Icon>
                {title || 'Item setting'}
              </h4>
            </div>
          </div>

          <div className='center setting-panel'>
            {children}
          </div>
        </div>
      </div>
    )
  }
}

ItemSetting.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  theme: PropTypes.object.isRequired,
  localStorage: PropTypes.object.isRequired,
  serverStorage: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired
}

export default ItemSetting
