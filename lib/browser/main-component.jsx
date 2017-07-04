'use strict'

import classnames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Gridifier } from 'react-gridifier/dist/materialize'
import { Navbar, NavItem, Icon, Button } from 'react-materialize'

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
          className={classnames({ [theme.backgrounds.card]: !this.state.editMode, [theme.backgrounds.editing]: this.state.editMode })}
        >
          <NavItem onClick={this.toggleEditMode.bind(this)}><Icon>edit</Icon><span className='hide-on-large-only'>Edit mode</span></NavItem>

        </Navbar>
        <Gridifier editable={this.state.editMode} sortDispersion orderHandler={this.orderHandler} />
        <Button floating fab='vertical' icon='insert_chart' className='red' large style={{top: '45px', right: '24px'}}>
          <Button floating icon='insert_chart' className='red'/>
          <Button floating icon='format_quote' className='yellow darken-1'/>
          <Button floating icon='publish' className='green'/>
          <Button floating icon='attach_file' className='blue'/>
        </Button>
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
