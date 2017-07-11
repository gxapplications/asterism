'use strict'

import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Gridifier } from 'react-gridifier/dist/materialize'
import { Navbar, NavItem, Icon } from 'react-materialize'
import { TransitionGroup } from 'react-transition-group'

import AddCategoryButtons from './edition/add-category-buttons'
import defaultMaterialTheme from './default-material-theme'
import OrderHandler from './order-handler'

import 'react-gridifier/dist/styles.css'
import './styles.css'

class MainComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      editMode: false,
      animationLevel: 3, // 1..3 TODO: setting from a setting panel (from localstorage?)
      addItems: { // TODO: async loading... only when state.editMode turns ON
        domotics: [],
        security: [],
        screening: [],
        communication: [],
        information: [],
        development: [
          {
            title: 'Debug log',
            isNew: true
          },
          {
            title: 'Other old thing'
          }
        ]
      }
    }

    this.orderHandler = new OrderHandler(window.localStorage, 'asterism-order-handler')
    // TODO: add param for defaultOrder from DB at instantiation
    // TODO: getLocalOrder() and setLocalOrder() must be used in a settings panel to persist to/from DB
  }

  render () {
    const { theme } = this.props
    const { editMode, animationLevel, addItems } = this.state
    return (
      <div className={cx('asterism', theme.backgrounds.body)}>
        <Navbar fixed brand='&nbsp;&nbsp;⁂&nbsp;&nbsp;' href={null} right
          options={{ closeOnClick: true }}
          className={cx({ [theme.backgrounds.card]: !editMode, [theme.backgrounds.editing]: editMode })}
        >
          <NavItem onClick={this.toggleEditMode.bind(this)}><Icon>edit</Icon><span className='hide-on-large-only'>Edit mode</span></NavItem>
        </Navbar>

        <Gridifier editable={editMode} sortDispersion orderHandler={this.orderHandler} />

        {animationLevel >= 3 ? (
          <TransitionGroup>
            {editMode ? (<AddCategoryButtons animationLevel={animationLevel} theme={theme} items={addItems} />) : null}
          </TransitionGroup>
        ) : (editMode ? (<AddCategoryButtons animationLevel={animationLevel} theme={theme} items={addItems} />) : null)}
      </div>
    )
  }

  toggleEditMode () {
    this.setState({ editMode: !this.state.editMode })
  }
}

MainComponent.propTypes = {
  theme: PropTypes.object.isRequired
}

MainComponent.defaultProps = {
  theme: defaultMaterialTheme
}

export default MainComponent

export { MainComponent }
