'use strict'

/* global $ */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon } from 'react-materialize'

class ItemSetting extends React.Component {
  componentDidMount () {
    $('#item-setting-modal').modal({
      dismissible: false
    })
  }

  render () {
    const { theme, children } = this.props
    return (
      <div id='item-setting-modal' className={cx('modal', theme.backgrounds.body)}>
        <div className='modal-content'>
          <div className={cx('coloring-header', theme.backgrounds.editing)}>
            <div>
              <h4>
                <Icon small>settings</Icon>
                Setting for a panel ??? TODO !1
              </h4>
            </div>
          </div>

          <div className='center'>
            {children}
          </div>
        </div>
      </div>
    )
  }
}

ItemSetting.propTypes = {
  theme: PropTypes.object.isRequired,
  localStorage: PropTypes.object.isRequired,
  serverStorage: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired
}

export default ItemSetting
