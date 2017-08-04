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

import 'react-gridifier/dist/styles.css'
import './styles.css'

const localStorage = new DefaultLocalStorage('asterism')

class MainComponent extends React.Component {
  constructor (props) {
    super(props)

    // Instantiate orderHandler and initial items for this.state (need to be sync)
    this.itemManager = new ItemManager(props.localStorage, props.serverStorage, this)

    this.state = {
      editMode: false,
      animationLevel: parseInt(props.localStorage.getItem('settings-animation-level') || 3), // 1..3
      itemFactories: (process.env.ASTERISM_ITEM_FACTORIES || []).map((toRequire) => {
        const Clazz = plugins.itemFactories[toRequire].default
        const factory = new Clazz({
          localStorage: props.localStorage.createSubStorage(toRequire),
          serverStorage: props.serverStorage.createSubStorage(toRequire),
          mainState: this.state }) // context given here
        factory.id = toRequire
        Object.freeze(factory) // protection against hacks
        return factory
      }),
      items: () => this.itemManager.getAllItems() // must be kept async for init case
    }
  }

  componentDidMount () {
    // dynamic CSS for background color
    const bgColor = $('div.asterism').css('background-color')
    $('div.asterism').css('box-shadow', `0 2000px 0 2000px ${bgColor}`)
    $('div.asterism .navbar-fixed ul.side-nav').css('background-color', bgColor)
  }

  render () {
    const { theme, localStorage, serverStorage } = this.props
    const { editMode, animationLevel, itemFactories, items } = this.state
    return (
      <div className={cx('asterism', theme.backgrounds.body)}>
        <Navbar fixed brand='&nbsp;&nbsp;⁂&nbsp;&nbsp;' href={null} right
          options={{ closeOnClick: true }}
          className={cx({ [theme.backgrounds.card]: !editMode, [theme.backgrounds.editing]: editMode })}
        >
          {editMode ? (
            <NavItem onClick={this.openSettingsModal.bind(this)} className='waves-effect waves-light'>
              <Icon>settings</Icon>
              <span className='hide-on-large-only'>Settings</span>
            </NavItem>
          ) : null}
          <NavItem onClick={this.toggleEditMode.bind(this)} className='waves-effect waves-light'>
            <Icon>edit</Icon>
            <span className='hide-on-large-only'>{editMode ? 'End edition' : 'Edit mode'}</span>
          </NavItem>
        </Navbar>

        <Gridifier editable={editMode} sortDispersion orderHandler={this.itemManager.orderHandler}>
          {items()}
        </Gridifier>

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

  pushItems (items) {
    this.setState({ items: () => items })
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
