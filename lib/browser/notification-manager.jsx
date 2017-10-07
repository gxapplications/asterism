'use strict'

import cx from 'classnames'
import React from 'react'
import { NavItem } from 'react-materialize'

const _translateCss = (css, theme) => {
  switch (css) {
    case 'error':
      return theme.feedbacks.error
    default:
      return ''
  }
}

export default class NotificationManager {
  constructor (mainComponent, logger) {
    this.mainComponent = mainComponent
    this.logger = logger
    this.navItems = []
  }

  setCallback (func) {
    // works only once to avoid a replace.
    if (!this.callback) {
      this.callback = func
      Object.freeze(this.callback)
    }
  }

  update (socketMessages) {
    socketMessages.forEach((message) => {
      let animation = []
      switch (message.command) {
        case 'highlight':
          animation.push('animation wobble-scaled-80')
          setTimeout(() => {
            let item = this.navItems.find((i) => i.id === message.id) || {}
            delete item.animation
            this.mainComponent.setState({ notifications: this.navItems })
          }, 4000)

          // fall through
        case 'set':
          let item = this.navItems.find((i) => i.id === message.id) || {}
          if (!item.id) {
            this.navItems.push(item)
          }
          item.id = message.id
          item.icon = message.icon
          item.css = message.css
          item.animation = animation
          item.onClick = () => {
            this.callback(item.id, (serverResult) => {
              if (serverResult.success) {
                let item = this.navItems.find((i) => i.id === message.id) || {}
                item.feedback = 'animation rubberBand80'
                this.mainComponent.setState({ notifications: this.navItems })
                setTimeout(() => {
                  let item = this.navItems.find((i) => i.id === message.id) || {}
                  delete item.feedback
                  this.mainComponent.setState({ notifications: this.navItems })
                }, 2000)
              } else if (serverResult.error) {
                this.logger.error(serverResult.error)
                this.mainComponent.setState({ messageModal: { message: serverResult.error, icon: message.icon } })
              }
            })
          }
          break
        case 'remove':
          this.navItems = this.navItems.filter((i) => i.id !== message.id) || {}
          break
        default:
          this.logger.error('Notification update: Unknown command!')
      }
    })
    this.mainComponent.setState({ notifications: this.navItems })
  }

  getComponents ({ animationLevel, theme }) {
    return this.navItems.map((item, idx) => (
      <NavItem key={idx}
        className={cx(
          'notification-item',
          `notification-item-${item.id}`,
          animationLevel >= 2 ? 'waves-effect waves-light' : '',
          item.animation,
          item.feedback,
          _translateCss(item.css, theme)
        )}
        href='javascript:void(0)' onClick={item.onClick}
      >
        <i className={cx('material-icons', item.icon)}>{item.icon}</i>
      </NavItem>
    ))
  }
}
