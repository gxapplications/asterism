'use strict'

/* global $, plugins */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Tab, Tabs, Navbar, NavItem } from 'react-materialize'

import Security from './settings-security'
import UserInterface from './settings-ui'

class Settings extends React.Component {
  constructor (props) {
    super(props)
    this._activeTabIndex = 0

    // Plugin settings panels
    this.pluginSettingsPanels = (process.env.ASTERISM_SETTINGS_PANELS || []).map((toRequire) => {
      return {
        'Panel': plugins.settingsPanels[toRequire.module].default,
        'privateSocket': props.socketManager.connectPrivateSocket(toRequire.privateSocket),
        'publicSockets': toRequire.publicSockets.reduce((acc, namespace) => {
          acc[namespace] = props.socketManager.connectPublicSocket(namespace)
          return acc
        }, {}),
        'serverStorage': props.serverStorage.createSubStorage(toRequire.libName)
      }
    })
  }

  componentDidMount () {
    $('#settings-modal').modal({
      dismissible: false,
      opacity: 0.5,
      inDuration: this.props.animationLevel >= 2 ? 300 : 0,
      outDuration: this.props.animationLevel >= 2 ? 300 : 0,
      endingTop: '5%',
      onOpenStart: () => {
        $('#settings-modal > nav > div.nav-wrapper').addClass(this.props.theme.backgrounds.editing)
        $('#settings-modal .sidenav-trigger').remove()
        $('#settings-modal > nav > div.nav-wrapper > ul').removeClass('hide-on-med-and-down')
        $('#settings-modal > nav > .nav-content > ul.tabs').tabs({ onShow: (p) => {
          $(`#settings-modal > nav > .nav-content > ul.tabs > li.tab > a[href^='#']`).each((idx, el) => {
            if ($(el).attr('href') === p.selector) {
              this._activeTabIndex = idx
            }
          })
        } })

        $('#settings-modal > nav > .nav-content > ul.tabs').tabs('updateTabIndicator')
      },
      onOpenEnd: () => {
        $('#settings-modal > nav > .nav-content > ul.tabs').tabs('updateTabIndicator')
      }
    })
  }

  shouldComponentUpdate () {
    return false // never refresh this, it's ok !
  }

  render () {
    const { theme, localStorage, serverStorage, itemManager, animationLevel } = this.props

    const tabs = (
      <Tabs className={theme.backgrounds.editing}>
        <Tab title='Security' active={this._activeTabIndex === 0}>
          <Security theme={theme} serverStorage={serverStorage}
            animationLevel={animationLevel}
            showRefreshButton={this.showRefreshButton.bind(this)} />
        </Tab>
        <Tab title='User interface' active={this._activeTabIndex === 1}>
          <UserInterface localStorage={localStorage} theme={theme} animationLevel={animationLevel}
            itemManager={itemManager} serverStorage={serverStorage}
            showRefreshButton={this.showRefreshButton.bind(this)} />
        </Tab>
        {this.pluginSettingsPanels.map(({ Panel, privateSocket, publicSockets, serverStorage }, idx) => (
          <Tab title={Panel.tabName || idx} key={idx + 2} active={this._activeTabIndex === idx + 2}>
            <Panel localStorage={localStorage} theme={theme} animationLevel={animationLevel}
              serverStorage={serverStorage} showRefreshButton={this.showRefreshButton.bind(this)}
              privateSocket={privateSocket} publicSockets={publicSockets} />
          </Tab>
        ))}
      </Tabs>
    )

    return (
      <div id='settings-modal' className={cx('modal thin-scrollable', theme.backgrounds.body)}>
        <Navbar
          alignLinks='right' extendWith={tabs}
          brand={<span>
            <Icon small>settings</Icon>
            <span className='hide-on-small-only'>Settings</span>
          </span>}
        >
          <NavItem href='javascript:void(0)' id='settings-modal-refresh-button'
            className={cx(
              'hide btn',
              { 'waves-effect waves-light': animationLevel >= 2 },
              theme.actions.edition
            )}
            onClick={this.reloadPage.bind(this)}
          >
            <span className='hide-on-med-and-down'>Close and reload screen</span>
            <span className='hide-on-small-only hide-on-large-only'>Close &amp; reload</span>
            <span className='hide-on-med-and-up'>Close</span>
          </NavItem>
          <NavItem href='javascript:void(0)' id='settings-modal-close-button'
            className={cx(
              'modal-action modal-close',
              { 'waves-effect waves-light': animationLevel >= 2 }
           )}
          >
            Close
          </NavItem>
        </Navbar>
      </div>
    )
  }

  showRefreshButton () {
    $('#settings-modal-refresh-button').removeClass('hide')
    $('#settings-modal-close-button').addClass('hide')
  }

  reloadPage () {
    window.location.reload()
  }
}

Settings.propTypes = {
  theme: PropTypes.object.isRequired,
  localStorage: PropTypes.object.isRequired,
  serverStorage: PropTypes.object.isRequired,
  itemManager: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired
}

export default Settings
