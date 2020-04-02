'use strict'

/* global $, plugins, process */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Gridifier } from 'react-gridifier/dist/materialize'
import { Icon, Navbar, NavItem } from 'react-materialize'
import { TransitionGroup } from 'react-transition-group'
import debounce from 'debounce'

import { version } from '../../package.json'
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
import { thenSleep, sleep, hasCookie, deleteCookie } from './tools'

import 'react-gridifier/dist/styles.css'
import './asterism.css'
import 'asterism-plugin-library/styles.css'

const localStorage = new DefaultLocalStorage('asterism')

class MainComponent extends React.Component {
  constructor (props) {
    super(props)

    this.logger = logger(this)

    this.readOnly = hasCookie('readOnly-access-token')
    this.securityOn = hasCookie('readOnly-access-token') || hasCookie('admin-access-token')

    this.notificationManager = new NotificationManager(this, this.logger)
    this.socketManager = new SocketManager(this.notificationManager, this.logger)
    // Instantiate orderHandler and initial items for this.state (need to be sync)
    this.itemManager = new ItemManager(props.localStorage, props.serverStorage, this)

    const mainState = this.getState.bind(this)
    mainState.set = this.setState.bind(this)
    mainState.openEditPanel = (panelLibName, idx = 0) => {
      this.openEditPanel(this.state.editPanels.filter(ep => ep.libName === panelLibName)[idx].Panel)
    }
    mainState.openSettings = (tabId) => {
      if (this.readOnly) {
        this.openPermissionsModal()
      } else {
        setTimeout(() => {
          $('#settings-modal').modal('open')
          try {
            const id = $(`#${tabId}`).parent().attr('id')
            setTimeout(() => {
              $('#settings-modal ul.tabs').tabs('select', id)
            }, 400)
          } catch (error) {
            console.error(error)
          }
        }, this.state.editMode ? 100 : 1200)
        this.setState({ editMode: true })
      }
    }
    mainState.logout = this.logout.bind(this)

    // PWA install prompt
    window.addEventListener('beforeinstallprompt', event => {
      this.logger.log('beforeinstallprompt triggered!')
      // event.preventDefault() // to avoid classical install webAPK banner
      this.setState({ deferredInstallPrompt: {
        event,
        clean: () => this.setState({ deferredInstallPrompt: null }),
        prompt: () => {
          event.prompt()
          return event.userChoice.then((choiceResult) => {
            // https://web.dev/customize-install
            if (choiceResult.outcome === 'accepted') {
              this.logger.log('User accepted the install prompt')
              this.state.deferredInstallPrompt && this.state.deferredInstallPrompt.clean()
            } else {
              this.logger.log('User dismissed the install prompt')
            }
            return choiceResult.outcome === 'accepted'
          })
        }
      } })
    })

    this.speechManager = new SpeechManager(this, props.localStorage, this.logger, mainState)

    this.services = (process.env.ASTERISM_SERVICES || []).reduce((map, toRequire) => {
      if (!toRequire) {
        return map
      }
      const Clazz = plugins.services[toRequire.service].default
      const instance = new Clazz({
        getServices: () => map,
        notificationManager: this.notificationManager,
        mainState,
        privateSocket: toRequire.privateSocket ? this.socketManager.connectPrivateSocket(toRequire.privateSocket) : null,
        publicSockets: toRequire.publicSockets ? toRequire.publicSockets.reduce((acc, namespace) => {
          acc[namespace] = this.socketManager.connectPublicSocket(namespace)
          return acc
        }, {}) : []
      })

      map[toRequire.libName] = instance
      return map
    }, {})

    this.state = {
      editMode: (window.document.location.hash === '#edit' && !this.readOnly),
      animationLevel: parseInt(props.localStorage.getItem('settings-animation-level') || 3), // 1..3
      itemFactories: (process.env.ASTERISM_ITEM_FACTORIES || []).map((toRequire) => {
        const Clazz = plugins.itemFactories[toRequire.module].default
        const factory = new Clazz({
          localStorage: props.localStorage.createSubStorage(toRequire.libName),
          serverStorage: props.serverStorage.createSubStorage(toRequire.libName),
          mainState,
          theme: props.theme,
          privateSocket: toRequire.privateSocket ? this.socketManager.connectPrivateSocket(toRequire.privateSocket) : null,
          publicSockets: toRequire.publicSockets ? toRequire.publicSockets.reduce((acc, namespace) => {
            acc[namespace] = this.socketManager.connectPublicSocket(namespace)
            return acc
          }, {}) : [],
          services: this.services
        }) // context given here
        factory.id = toRequire.module
        Object.freeze(factory) // protection against hacks
        return factory
      }),
      editPanels: (process.env.ASTERISM_EDIT_PANELS || []).map((toRequire) => {
        const Clazz = plugins.editPanels[toRequire.module].default
        return {
          libName: toRequire.libName,
          label: Clazz.label,
          icon: Clazz.icon,
          Panel: Clazz,
          privateSocket: toRequire.privateSocket ? this.socketManager.connectPrivateSocket(toRequire.privateSocket) : null,
          publicSockets: toRequire.publicSockets ? toRequire.publicSockets.reduce((acc, namespace) => {
            acc[namespace] = this.socketManager.connectPublicSocket(namespace)
            return acc
          }, {}) : []
        }
      }),
      items: [],
      itemSettingPanel: null,
      EditPanel: null,
      editPanelButtonHighlight: false,
      animationFlow: null,
      notifications: [], // not directly used to render, but to trigger a render() when modified
      messageModal: null,
      speechDialog: null,
      deferredInstallPrompt: null
      // logs: []
    }
  }

  componentDidMount () {
    // dynamic CSS for background color
    const bgColor = $('div.asterism').css('background-color')
    const navbarColor = $('div.asterism .navbar-fixed > nav').css('background-color')
    const textColor = $('div.asterism').css('color')
    $('div.asterism').css('box-shadow', `0 2000px 0 2000px ${bgColor}`)
    $('div.asterism .navbar-fixed ul.side-nav').css('background-color', navbarColor)
    $('div.asterism .navbar-fixed ul.side-nav').css('color', textColor)

    // FIXME: to delete when react-materialize will work... jquery.initialize.min.js must also be deleted!
    $.initialize('.input-field input', function () {
      if ($(this).val().length) {
        $(this).parent().next('label').addClass('active')
        $(this).nextAll('label').addClass('active') // useful for autocomplete components
      }
    })

    // If readOnly scope
    if (this.readOnly) {
      $('#permissionsModal').modal({
        dismissible: true,
        inDuration: this.state.animationLevel >= 2 ? 300 : 0,
        outDuration: this.state.animationLevel >= 2 ? 300 : 0
      })
    }

    // On some window events, refresh items or freeze them
    const debouncerRefreshItems = debounce(this.refreshItems.bind(this), 5000, true)
    window.addEventListener('pageshow',
      () => this.state.items.length ? debouncerRefreshItems() : null)
    window.addEventListener('focus', debouncerRefreshItems)
    window.addEventListener('online', debouncerRefreshItems)
    window.addEventListener('offline', (event) => {
      debouncerRefreshItems.clear()
      this.freezeItems(event)
    })
    window.addEventListener('pagehide', (event) => {
      debouncerRefreshItems.clear()
      this.freezeItems(event)
    })

    // Instantiate items
    sleep(320).then(this.instantiateItems.bind(this))
    $('div.asterism .navbar-fixed > nav').css('height', 'inherit')
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
        .then(thenSleep(350))
        .then(({ rect, bullet, header, bulletIcon }) => {
          bullet.removeClass('shrink')
          $(header).addClass(this.props.theme.backgrounds.editing)
          return { rect, bullet, bulletIcon }
        })
        .then(thenSleep(700))
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

    // If a message modal should be displayed
    if (this.state.messageModal) {
      $('#messageModal').modal({
        dismissible: true,
        inDuration: this.state.animationLevel >= 2 ? 300 : 0,
        outDuration: this.state.animationLevel >= 2 ? 300 : 0,
        complete: () => {
          this.setState({ messageModal: null })
        }
      })
      $('#messageModal').modal('open')
    }

    // If an EditPanel should be displayed
    if (this.state.EditPanel && !prevState.EditPanel) {
      $('#edit-panel-modal').modal({
        dismissible: false,
        startingTop: '1%',
        endingTop: '4%',
        opacity: 0.5,
        inDuration: this.state.animationLevel >= 2 ? 300 : 0,
        outDuration: this.state.animationLevel >= 2 ? 300 : 0,
        onOpenStart: () => {
          $('#edit-panel-modal > nav > div.nav-wrapper').addClass(this.props.theme.backgrounds.editing)
          $('#edit-panel-modal .sidenav-trigger').remove()
          $('#edit-panel-modal > nav > div.nav-wrapper > ul').removeClass('hide-on-med-and-down')
          if (this.state.EditPanel && this.state.EditPanel.onOpenStart) {
            this.state.EditPanel.onOpenStart(this.props.theme)
          }
        },
        onOpenEnd: () => {
          if (this.state.EditPanel && this.state.EditPanel.onOpenEnd) {
            this.state.EditPanel.onOpenEnd(this.props.theme)
          }
        },
        onCloseEnd: () => {
          this.setState({ EditPanel: null })
        }
      })
      $('#edit-panel-modal').modal('open')
    }
  }

  render () {
    const { theme, localStorage, serverStorage } = this.props
    const { editMode, animationLevel, itemFactories, editPanels, EditPanel, items, itemSettingPanel, messageModal,
      speechDialog, editPanelButtonHighlight, logs } = this.state
    const SpeechStatus = this.speechManager.getComponent()
    const notifications = this.notificationManager.getComponents({ animationLevel, theme })
    const editPanelContext = EditPanel ? editPanels.find((ep) => ep.Panel === EditPanel) : {}

    return (
      <div className={cx('asterism', theme.backgrounds.body)}>
        <Navbar fixed brand={<a>⁂</a>} alignLinks='right'
          options={{ preventScrolling: true, edge: 'left', closeOnClick: true, draggable: true }}
          className={cx(editMode ? theme.backgrounds.editing : theme.backgrounds.card, animationLevel >= 2 ? 'animated' : null)}
        >
          <NavItem key='closing-header' href='javascript:$("div.sidenav-overlay").click()'
            className={cx('closing-header', 'hide-on-large-only',
              animationLevel >= 2 ? 'waves-effect waves-light' : '',
              editMode ? theme.backgrounds.editing : theme.backgrounds.card)}>
            <i className={cx('material-icons', 'close')}>close</i>
            <span className='truncate'>{window.location.pathname.split('/').filter(p => p).join('/') || 'asterism'}</span>
            <pre>v{version}</pre>
          </NavItem>

          {editMode ? null : notifications}
          {editMode ? null : (
            <SpeechStatus animationLevel={animationLevel} />
          )}

          {editMode ? editPanels.map(({ label, icon, Panel }, idx) => (
            <NavItem key={idx} onClick={this.openEditPanel.bind(this, Panel)} href='javascript:void(0)'
              className={cx(animationLevel >= 2 ? 'waves-effect waves-light' : '')}>
              <i className={cx('material-icons', icon)}>{icon}</i>
              <span className='hide-on-large-only'>{label}</span>
            </NavItem>
          )) : null}

          {editMode ? (
            <NavItem onClick={this.openSettingsModal.bind(this)} href='javascript:void(0)'
              className={cx(animationLevel >= 2 ? 'waves-effect waves-light' : '')}>
              <Icon>settings</Icon>
              <span className='hide-on-large-only'>Settings</span>
            </NavItem>
          ) : null}
          {this.readOnly ? null : (<NavItem onClick={this.toggleEditMode.bind(this)} href='javascript:void(0)'
            className={cx(animationLevel >= 2 ? 'waves-effect waves-light' : '')}>
            <Icon>{editMode ? 'check_circle' : 'edit'}</Icon>
            <span className='hide-on-large-only'>{editMode ? 'End edition' : 'Edit mode'}</span>
          </NavItem>)}
          {this.securityOn ? (<NavItem onClick={this.logout.bind(this)} href='javascript:void(0)'
            className={cx(animationLevel >= 2 ? 'waves-effect waves-light' : '')}>
            <Icon>lock_open</Icon>
            <span className='hide-on-large-only'>Logout</span>
          </NavItem>) : null}
        </Navbar>

        {false && <pre className='logger'>
          <ul>
            {logs.map((log, idx) => (
              <li key={idx}>{log}</li>
            ))}
          </ul>
        </pre>}

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
            itemManager={this.itemManager} socketManager={this.socketManager} theme={theme}
            mainState={this.getState.bind(this)} />
        ) : null}

        {editMode && itemSettingPanel ? (
          <ItemSetting animationLevel={animationLevel} localStorage={localStorage}
            icon={itemSettingPanel.props.icon} title={itemSettingPanel.props.title}
            serverStorage={serverStorage} theme={theme}>{itemSettingPanel}</ItemSetting>
        ) : null}

        {editMode && EditPanel ? (
          <div id='edit-panel-modal' className={cx('modal thin-scrollable', theme.backgrounds.body)}>
            <Navbar alignLinks='right' className={EditPanel.extendHeader ? theme.backgrounds.body : theme.backgrounds.editing} extendWith={EditPanel.extendHeader ? (
              <EditPanel serverStorage={serverStorage} theme={theme} animationLevel={animationLevel}
                localStorage={localStorage} services={() => this.services}
                privateSocket={editPanelContext.privateSocket} publicSockets={editPanelContext.publicSockets}
                ref={(c) => { this._editPanelInstance = c }} highlightCloseButton={this.highlightCloseButton.bind(this)} />
            ) : null} brand={
              <span>
                <i className={cx('material-icons small', EditPanel.icon)}>{EditPanel.icon}</i>
                <span className='hide-on-small-only'>{EditPanel.label}</span>
              </span>
            }>
              <NavItem href='javascript:void(0)' id='edit-panel-close-button'
                className={cx({
                  'btn': editPanelButtonHighlight,
                  [theme.actions.edition]: editPanelButtonHighlight,
                  'waves-effect waves-green': (animationLevel >= 3) && !editPanelButtonHighlight,
                  'waves-effect waves-light': (animationLevel >= 3) && editPanelButtonHighlight
                })}
                onClick={this.closeEditPanel.bind(this)}
              >
                {editPanelButtonHighlight ? (<span><Icon left>check</Icon> Ok</span>) : 'Close'}
              </NavItem>
            </Navbar>
            {EditPanel.extendHeader ? null : (
              <div className='modal-content thin-scrollable'>
                <EditPanel serverStorage={serverStorage} theme={theme} animationLevel={animationLevel}
                  localStorage={localStorage} services={() => this.services}
                  privateSocket={editPanelContext.privateSocket} publicSockets={editPanelContext.publicSockets}
                  ref={(c) => { this._editPanelInstance = c }} highlightCloseButton={this.highlightCloseButton.bind(this)} />
              </div>
            )}
          </div>
        ) : null}

        {messageModal ? (
          <div id='messageModal' className='modal'>
            <div className='modal-content'>
              <h4><i className={cx('material-icons', messageModal.icon)}>{messageModal.icon}</i> Error</h4>
              <p>{messageModal.message}</p>
            </div>
            <div className='modal-footer'>
              <a href='javascript:void(0)' className={cx(
                'btn modal-action modal-close btn-flat',
                { 'waves-effect waves-green': animationLevel >= 3 }
              )}><Icon>check</Icon></a>
            </div>
          </div>
        ) : null}

        {this.readOnly ? (
          <div id='permissionsModal' className='modal'>
            <div className='modal-content'>
              <h4><Icon left>verified_user</Icon> Admin required</h4>
              <p>You need admin privileges to access this feature.</p>
            </div>
            <div className='modal-footer'>
              <a href='javascript:void(0)' className={cx(
                  'btn modal-action modal-close btn-flat',
                  { 'waves-effect waves-light': animationLevel >= 3 }
              )}>Cancel</a>&nbsp;
              <a href='javascript:void(0)' onClick={this.logout.bind(this)} className={cx(
                  'btn modal-action modal-close btn-flat',
                  { 'waves-effect waves-green': animationLevel >= 3 }
              )}><Icon left>lock_open</Icon> Login as admin</a>
            </div>
          </div>
        ) : null}

        {this.speechManager.available ? (
          <div id='speech-popup' className='hide' onClick={this.speechManager.abortRecognition.bind(this.speechManager)}>
            <div className='bubble hide'>
              <Icon className='animation microphone'>mic</Icon>
            </div>
            <div id='speech-popup-dialog-container' className='hide'>
              <div className='dialog hide'>
                <div className='content'>
                  <Icon className='animation microphone'>mic</Icon>
                  <span className='title'>{speechDialog && speechDialog.question}</span>
                  <div className='sub-content'>
                    <ul>
                      {speechDialog && speechDialog.alternatives.map((alt, idx) => (
                        <li key={idx}>{alt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  toggleEditMode () {
    if (!this.readOnly) {
      $('#mobile-nav.sidenav').sidenav('close')
      this.setState({editMode: !this.state.editMode})
    }
  }

  openSettingsModal () {
    if (this.readOnly) {
      this.openPermissionsModal()
    } else {
      $('#mobile-nav.sidenav').sidenav('close')
      $('#settings-modal').modal('open')
    }
  }

  openEditPanel (Panel) {
    if (this.readOnly) {
      this.openPermissionsModal()
    } else {
      this.setState({ editMode: true, EditPanel: Panel })
    }
  }

  openPermissionsModal () {
    $('#permissionsModal').modal('open')
  }

  logout () {
    deleteCookie('readOnly-access-token')
    deleteCookie('admin-access-token')
    window.location.replace(`/login?then=${encodeURIComponent(window.location.pathname)}`)
  }

  closeEditPanel () {
    this.setState({
      editPanelButtonHighlight: false
    })

    if (this._editPanelInstance && !!this._editPanelInstance.handleCloseButton) {
      return this._editPanelInstance.handleCloseButton()
      .catch(() => { // rejected = not handled
        $('#edit-panel-modal').modal('close')
      })
    }

    $('#edit-panel-modal').modal('close')
  }

  highlightCloseButton () {
    this.setState({
      editPanelButtonHighlight: true
    })
  }

  getState () {
    return this.state
  }

  instantiateItems () {
    return Promise.all(this.itemManager.getAllItems())
    .then((items) => {
      console.log(`Restoring ${items.length} items in the grid...`)
      this.setState({ items })
    })
  }

  refreshItems (event) {
    this.logger.log('refreshItems' + (event && event.type))

    const items = this.state.items
    if (!items || items.length === 0) {
      return Promise.resolve()
    }

    return Promise.all(items.map((item) => {
      // Warning, to adapt if itemManager.encapsulateItem changes its children order!
      return item.props.children[0].props.initialParams.refresh(event)
    }))
  }

  freezeItems (event) {
    this.logger.log('freezeItems' + (event && event.type))

    const items = this.state.items
    if (!items || items.length === 0) {
      return Promise.resolve()
    }

    return Promise.all(items.map((item) => {
      // Warning, to adapt if itemManager.encapsulateItem changes its children order!
      return item.props.children[0].props.initialParams.freeze(event)
    }))
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
