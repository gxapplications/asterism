'use strict'

import cx from 'classnames'
import React from 'react'
import { Icon, NavItem } from 'react-materialize'

const _translateCss = (css, theme) => {
  switch (css) {
    case 'error':
      return theme.feedbacks.error
    default:
      return ''
  }
}

export default class NotificationManager {
  constructor (mainComponent) {
    this.mainComponent = mainComponent
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
          animation.push('animation wobble')
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
                item.feedback = 'animation rubberBand'
                this.mainComponent.setState({ notifications: this.navItems })
                setTimeout(() => {
                  let item = this.navItems.find((i) => i.id === message.id) || {}
                  delete item.feedback
                  this.mainComponent.setState({ notifications: this.navItems })
                }, 2000)
              } else if (serverResult.error) {
                console.log(serverResult.error)
                // TODO !1: if (serverResult.success === false) display serverResult.error in a modal ?
              }
            })
          }
          break
        case 'remove':
          this.navItems = this.navItems.filter((i) => i.id !== message.id) || {}
          break
        default:
          console.error('Notification update: Unknown command!')
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
        <Icon>{item.icon}</Icon>
      </NavItem>
    ))
  }
}
