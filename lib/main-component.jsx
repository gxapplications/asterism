'use strict'

import classnames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Gridifier } from 'react-gridifier/dist/materialize'
import { Navbar, NavItem, Icon } from 'react-materialize'

import defaultMaterialTheme from './default-material-theme'
import OrderHandler from './order-handler'

import 'react-gridifier/dist/styles.css'
import './styles.css'

class MainComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      editMode: false
    }

    this.orderHandler = new OrderHandler(window.localStorage, 'asterism-order-handler')
  }

  render () {
    const { theme } = this.props
    return (
      <div className={classnames('asterism', theme.backgrounds.body)}>
        <Navbar fixed brand='&nbsp;&nbsp;⁂&nbsp;&nbsp;' href={null} right
          options={{ closeOnClick: true }}
          className={classnames({ 'teal': !this.state.editMode, 'green': this.state.editMode })}
        >
          <NavItem onClick={this.toggleEditMode.bind(this)}><Icon>edit</Icon>Edit mode</NavItem>
        </Navbar>
        <Gridifier editable={this.state.editMode} sortDispersion orderHandler={this.orderHandler} />
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
