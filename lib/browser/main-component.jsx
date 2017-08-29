'use strict'

/* global $, plugins, process */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Gridifier } from 'react-gridifier/dist/materialize'
import { Navbar, NavItem, Icon } from 'react-materialize'
import { TransitionGroup } from 'react-transition-group'

import AddCategoryButtons from './edition/add-category-buttons'
import DefaultMaterialTheme from './default-material-theme'
import DefaultLocalStorage from './default-local-storage'
import DefaultServerStorage from './default-server-storage'
import ItemManager from './item-manager'
import Settings from './edition/settings'
import SocketManager from './socket-manager'
import ItemSetting from './edition/item-setting'
import { thenSleep } from './tools'

import 'react-gridifier/dist/styles.css'
import './styles.css'

const localStorage = new DefaultLocalStorage('asterism')

class MainComponent extends React.Component {
  constructor (props) {
    super(props)

    this.socketManager = new SocketManager()

    // Instantiate orderHandler and initial items for this.state (need to be sync)
    this.itemManager = new ItemManager(props.localStorage, props.serverStorage, this)

    this.state = {
      editMode: false,
      animationLevel: parseInt(props.localStorage.getItem('settings-animation-level') || 3), // 1..3
      itemFactories: (process.env.ASTERISM_ITEM_FACTORIES || []).map((toRequire) => {
        const Clazz = plugins.itemFactories[toRequire.module].default
        const factory = new Clazz({
          localStorage: props.localStorage.createSubStorage(toRequire.module),
          serverStorage: props.serverStorage.createSubStorage(toRequire.module),
          mainState: this.getState.bind(this),
          theme: props.theme,
          privateSocket: this.socketManager.connectPrivateSocket(toRequire.privateSocket),
          publicSockets: toRequire.publicSockets.map(this.socketManager.connectPublicSocket)
        }) // context given here
        factory.id = toRequire.module
        Object.freeze(factory) // protection against hacks
        return factory
      }),
      items: [],
      itemSettingPanel: null,
      animationFlow: null
    }
  }

  componentDidMount () {
    // dynamic CSS for background color
    const bgColor = $('div.asterism').css('background-color')
    $('div.asterism').css('box-shadow', `0 2000px 0 2000px ${bgColor}`)
    $('div.asterism .navbar-fixed ul.side-nav').css('background-color', bgColor)

    Promise.all(this.itemManager.getAllItems())
    .then(thenSleep(300)) // for cosmetics... can be removed.
    .then((items) => {
      this.setState({ items })
    })
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.itemSettingPanel && !prevState.itemSettingPanel) {
      $('#item-setting-modal').modal('open')

      if (this.state.animationFlow && this.state.animationLevel >= 3) {
        const animationFlow = this.state.animationFlow
        animationFlow.then(thenSleep(300)) // wait modal to be at right place
        .then(({ rect, bullet }) => {
          const header = $('#item-setting-modal .coloring-header')[0]
          const headerBounds = header.getBoundingClientRect()
          rect.css({ top: headerBounds.top, left: headerBounds.left, height: headerBounds.height, width: headerBounds.width })
          return { rect, bullet, header }
        })
        .then(thenSleep(200))
        .then(({ rect, bullet, header }) => {
          bullet.removeClass('shrink')
          $(header).addClass(this.props.theme.backgrounds.editing)
          return { rect, bullet }
        })
        .then(thenSleep(500))
        .then(({ rect, bullet }) => {
          rect.css({ top: -100, left: -100, height: 10, width: 10, display: 'none' })
          bullet.css({ 'background-color': '#fff' })
          this.setState({ animationFlow: null })
        })
      }
    } else {
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
  }

  render () {
    const { theme, localStorage, serverStorage } = this.props
    const { editMode, animationLevel, itemFactories, items, itemSettingPanel } = this.state
    return (
      <div className={cx('asterism', theme.backgrounds.body)}>
        <Navbar fixed brand='&nbsp;&nbsp;⁂&nbsp;&nbsp;' href={null} right
          options={{ closeOnClick: true }}
          className={cx({ [theme.backgrounds.card]: !editMode, [theme.backgrounds.editing]: editMode })}
        >
          {editMode ? (
            <NavItem onClick={this.openSettingsModal.bind(this)} className={cx(animationLevel >= 2 ? 'waves-effect waves-light' : '')}>
              <Icon>settings</Icon>
              <span className='hide-on-large-only'>Settings</span>
            </NavItem>
          ) : null}
          <NavItem onClick={this.toggleEditMode.bind(this)} className={cx(animationLevel >= 2 ? 'waves-effect waves-light' : '')}>
            <Icon>edit</Icon>
            <span className='hide-on-large-only'>{editMode ? 'End edition' : 'Edit mode'}</span>
          </NavItem>
        </Navbar>

        {items.length ? (
          <Gridifier editable={editMode} sortDispersion orderHandler={this.itemManager.orderHandler}
            toggleTime={animationLevel >= 2 ? 500 : 1} coordsChangeTime={animationLevel >= 2 ? 300 : 1}
            gridResizeDelay={animationLevel >= 2 ? 80 : 160}>
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
            itemManager={this.itemManager} theme={theme} />
        ) : null}

        {editMode && itemSettingPanel ? (
          <ItemSetting animationLevel={animationLevel} localStorage={localStorage}
            icon={itemSettingPanel.props.icon} title={itemSettingPanel.props.title}
            serverStorage={serverStorage} theme={theme}>{itemSettingPanel}</ItemSetting>
        ) : null}
      </div>
    )
  }

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
