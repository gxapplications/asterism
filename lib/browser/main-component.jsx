'use strict'

/* global $, plugins, process */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Gridifier } from 'react-gridifier/dist/materialize'
import { Icon, Navbar, NavItem } from 'react-materialize'
import { TransitionGroup } from 'react-transition-group'

import AddCategoryButtons from './edition/add-category-buttons'
import DefaultMaterialTheme from './default-material-theme'
import DefaultLocalStorage from './default-local-storage'
import DefaultServerStorage from './default-server-storage'
import ItemManager from './item-manager'
import ItemSetting from './edition/item-setting'
import logger from './logger'
import NotificationManager from './notification-manager'
import Settings from './edition/settings'
import SocketManager from './socket-manager'
import SpeechManager from './speech-manager'
import { thenSleep } from './tools'

import 'react-gridifier/dist/styles.css'
import './styles.css'

const localStorage = new DefaultLocalStorage('asterism')

class MainComponent extends React.Component {
  constructor (props) {
    super(props)

    this.logger = logger(this) // FIXME: to disable, one day...

    this.notificationManager = new NotificationManager(this, this.logger)
    this.socketManager = new SocketManager(this.notificationManager, this.logger)
    this.speechManager = new SpeechManager(this, props.localStorage, this.logger)

    // Instantiate orderHandler and initial items for this.state (need to be sync)
    this.itemManager = new ItemManager(props.localStorage, props.serverStorage, this)

    const mainState = this.getState.bind(this)
    mainState.set = this.setState.bind(this)

    this.state = {
      editMode: false,
      animationLevel: parseInt(props.localStorage.getItem('settings-animation-level') || 3), // 1..3
      itemFactories: (process.env.ASTERISM_ITEM_FACTORIES || []).map((toRequire) => {
        const Clazz = plugins.itemFactories[toRequire.module].default
        const factory = new Clazz({
          localStorage: props.localStorage.createSubStorage(toRequire.libName),
          serverStorage: props.serverStorage.createSubStorage(toRequire.libName),
          mainState,
          theme: props.theme,
          privateSocket: this.socketManager.connectPrivateSocket(toRequire.privateSocket),
          publicSockets: toRequire.publicSockets.reduce((acc, namespace) => {
            acc[namespace] = this.socketManager.connectPublicSocket(namespace)
            return acc
          }, {})
        }) // context given here
        factory.id = toRequire.module
        Object.freeze(factory) // protection against hacks
        return factory
      }),
      items: [],
      itemSettingPanel: null,
      animationFlow: null,
      notifications: [], // not directly used to render, but to trigger a render() when modified
      messageModal: null,
      speechDialog: null,
      logs: []
    }
  }

  componentDidMount () {
    // dynamic CSS for background color
    const bgColor = $('div.asterism').css('background-color')
    const textColor = $('div.asterism').css('color')
    $('div.asterism').css('box-shadow', `0 2000px 0 2000px ${bgColor}`)
    $('div.asterism .navbar-fixed ul.side-nav').css('background-color', bgColor)
    $('div.asterism .navbar-fixed ul.side-nav').css('color', textColor)

    Promise.all(this.itemManager.getAllItems())
    .then(thenSleep(300)) // for cosmetics... can be removed.
    .then((items) => {
      console.log(`Restoring ${items.length} items in the grid...`)
      this.setState({ items })
    })
  }

  componentDidUpdate (prevProps, prevState) {
    // If an ItemSettingPanel should be displayed
    if (this.state.itemSettingPanel && !prevState.itemSettingPanel) {
      $('#item-setting-modal').modal('open')

      if (this.state.animationFlow && this.state.animationLevel >= 3) {
        const animationFlow = this.state.animationFlow
        animationFlow.then(thenSleep(300)) // wait modal to be at right place
        .then(({ rect, bullet }) => {
          const bulletIcon = $('i', bullet)
          const header = $('#item-setting-modal .coloring-header')[0]
          const headerBounds = header.getBoundingClientRect()
          rect.css({ top: headerBounds.top, left: headerBounds.left, height: headerBounds.height, width: headerBounds.width })
          bulletIcon.css({ color: 'transparent' })
          return { rect, bullet, header, bulletIcon }
        })
        .then(thenSleep(200))
        .then(({ rect, bullet, header, bulletIcon }) => {
          bullet.removeClass('shrink')
          $(header).addClass(this.props.theme.backgrounds.editing)
          return { rect, bullet, bulletIcon }
        })
        .then(thenSleep(500))
        .then(({ rect, bullet, bulletIcon }) => {
          rect.css({ top: -100, left: -100, height: 10, width: 10, display: 'none' })
          bullet.css({ 'background-color': '#fff' })
          bulletIcon.css({ color: '#fff' })
          this.setState({ animationFlow: null })
        })
      }
    } else { // If an animation flow should be played
      if (this.state.animationFlow && this.state.animationLevel >= 3) {
        const animationFlow = this.state.animationFlow
        animationFlow.then(({ rect, bullet }) => {
          rect.css({ overflow: 'visible' })
          bullet.removeClass('shrink')
          return { rect, bullet }
        })
        .then(thenSleep(500))
        .then(({ rect, bullet }) => {
          rect.css({ top: -100, left: -100, height: 10, width: 10, display: 'none', overflow: 'hidden' })
          bullet.css({ 'background-color': '#fff' })
          this.setState({ animationFlow: null })
        })
      } else {
        $('#item-setting-modal .coloring-header').addClass(this.props.theme.backgrounds.editing)
      }
    }

    if (this.state.messageModal) {
      $('#messageModal').modal({
        dismissible: true,
        complete: () => {
          this.setState({ messageModal: null })
        }
      })
      $('#messageModal').modal('open')
    }
  }

  render () {
    const { theme, localStorage, serverStorage } = this.props
    const { editMode, animationLevel, itemFactories, items, itemSettingPanel, messageModal, speechDialog, logs } = this.state
    const SpeechStatus = this.speechManager.getComponent()
    const notifications = this.notificationManager.getComponents({ animationLevel, theme })

    return (
      <div className={cx('asterism', theme.backgrounds.body)}>
        <Navbar fixed brand='⁂' href={null} right
          options={{ closeOnClick: true }}
          className={cx({ [theme.backgrounds.card]: !editMode, [theme.backgrounds.editing]: editMode })}
        >
          {editMode ? null : notifications}
          {editMode ? null : (
            <SpeechStatus animationLevel={animationLevel} />
          )}
          {editMode ? null : (
            <NavItem divider />
          )}
          {editMode ? (
            <NavItem onClick={this.openSettingsModal.bind(this)} href='javascript:void(0)' className={cx(animationLevel >= 2 ? 'waves-effect waves-light' : '')}>
              <Icon>settings</Icon>
              <span className='hide-on-large-only'>Settings</span>
            </NavItem>
          ) : null}
          <NavItem onClick={this.toggleEditMode.bind(this)} href='javascript:void(0)' className={cx(animationLevel >= 2 ? 'waves-effect waves-light' : '')}>
            <Icon>{editMode ? 'check_circle' : 'edit'}</Icon>
            <span className='hide-on-large-only'>{editMode ? 'End edition' : 'Edit mode'}</span>
          </NavItem>
        </Navbar>

        <pre className='logger'>
          <ul>
            {logs.map((log, idx) => (
              <li key={idx}>{log}</li>
            ))}
          </ul>
        </pre>

        {items.length ? (
          <Gridifier editable={editMode} sortDispersion orderHandler={this.itemManager.orderHandler}
            toggleTime={animationLevel >= 2 ? 500 : 1} coordsChangeTime={animationLevel >= 2 ? 300 : 1}
            gridResizeDelay={animationLevel >= 2 ? 80 : 160} ref={(c) => { this.gridComponent = c }}>
            {items}
          </Gridifier>
        ) : null}

        {animationLevel >= 3 ? (
          <TransitionGroup>
            {editMode ? (<AddCategoryButtons animationLevel={animationLevel} theme={theme}
              itemManager={this.itemManager} itemFactories={itemFactories} />) : null}
          </TransitionGroup>
        ) : (editMode ? (<AddCategoryButtons animationLevel={animationLevel} theme={theme}
          itemManager={this.itemManager} itemFactories={itemFactories} />) : null)}

        {editMode ? (
          <Settings animationLevel={animationLevel} localStorage={localStorage} serverStorage={serverStorage}
            itemManager={this.itemManager} socketManager={this.socketManager} theme={theme} />
        ) : null}

        {editMode && itemSettingPanel ? (
          <ItemSetting animationLevel={animationLevel} localStorage={localStorage}
            icon={itemSettingPanel.props.icon} title={itemSettingPanel.props.title}
            serverStorage={serverStorage} theme={theme}>{itemSettingPanel}</ItemSetting>
        ) : null}

        {messageModal ? (
          <div id='messageModal' className='modal'>
            <div className='modal-content'>
              <h4><Icon>{messageModal.icon}</Icon> Error</h4>
              <p>{messageModal.message}</p>
            </div>
            <div className='modal-footer'>
              <a href='#!' className='modal-action modal-close waves-effect waves-green btn-flat'><Icon>check</Icon></a>
            </div>
          </div>
        ) : null}

        {this.speechManager.available ? (
          <div id='speech-popup' className='hide' onClick={this.speechManager.abortRecognition.bind(this.speechManager)}>
            <div className='bubble hide'>
              <Icon className='animation microphone'>mic</Icon>
            </div>
            {speechDialog ? (
              <div id='speech-popup-dialog-container' className='hide'>
                <div className='dialog hide'>
                  <div className='content'>
                    <Icon className='animation microphone'>mic</Icon>
                    <span className='title'>{speechDialog.question}</span>
                    <div className='sub-content'>
                      <ul>
                        {speechDialog.alternatives.map((alt, idx) => (
                          <li key={idx}>{alt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  } // TODO !0: mise en page des alternatives, dans {speechDialog}

  toggleEditMode () {
    $('#nav-mobile.side-nav').sideNav('hide')
    this.setState({ editMode: !this.state.editMode })
  }

  openSettingsModal () {
    $('#nav-mobile.side-nav').sideNav('hide')
    $('#settings-modal').modal('open')
  }

  getState () {
    return this.state
  }
}

MainComponent.propTypes = {
  theme: PropTypes.object.isRequired,
  localStorage: PropTypes.object.isRequired,
  serverStorage: PropTypes.object.isRequired
}

MainComponent.defaultProps = {
  theme: new DefaultMaterialTheme(localStorage),
  localStorage: localStorage,
  serverStorage: new DefaultServerStorage('asterism')
}

export default MainComponent

export { MainComponent }
