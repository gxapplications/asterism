'use strict'

/* global $ */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Input, Icon } from 'react-materialize'

class ActionsDropdown extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      instances: [],
      types: [],
      creatingInstance: null,
      currentId: props.defaultActionId
    }

    this._editFormInstance = null
  }

  componentDidMount () {
    const service = this.props.scenariiService
    service.getActionTypes().then((types) => {
      return service.getActionInstances()
      .then((instances) => {
        this.setState({
          types: types.map((type) => ({
            id: type.id,
            type: type.type,
            onClick: () => {
              service.createActionInstance(type.id).then((newAction) => {
                this.setState({
                  creatingInstance: newAction
                })
              })
            }
          })),
          instances
        })
      })
    })
  }

  componentDidUpdate () {
    if (this.state.creatingInstance) {
      $(`#actions-dropdown-modal-${this.props.dropdownId}`).detach().appendTo('#app')
      $(`#actions-dropdown-modal-${this.props.dropdownId}`).modal({ dismissible: false })
      $(`#actions-dropdown-modal-${this.props.dropdownId}`).modal('open')
    }
  }

  render () {
    const { theme, animationLevel, dropdownId, scenariiService } = this.props
    const { types, instances, creatingInstance, currentId } = this.state

    const EditForm = (creatingInstance && creatingInstance.EditForm) || null

    return (
      <div id={`actions-dropdown-modal-anchor-${dropdownId}`}>
        <Input s={12} label='Action' type='select' icon='error' onChange={this.valueChanged.bind(this)} value={currentId}>
          {instances.map((instance, idx) => (
            <option key={instance.instanceId} value={instance.instanceId}>{instance.name}</option>
          ))}
          {types.map(({ id, type, onClick }, idx) => (
            <option key={type.name} value={id}>+ {type.shortLabel || type.name}</option>
          ))}
        </Input>
        {creatingInstance ? (
          <div id={`actions-dropdown-modal-${dropdownId}`} className={cx('modal modal-fixed-footer actions-dropdown-edit-panel', theme.backgrounds.body)}>
            <div className='modal-content'>
              <div className={cx('coloring-header', theme.backgrounds.editing)}>
                <h4>{EditForm.label || 'Action configuration'}</h4>
              </div>
              <div>
                <EditForm ref={(c) => { this._editFormInstance = c }}
                  instance={creatingInstance} scenariiService={scenariiService}
                  theme={theme} animationLevel={animationLevel}
                />
              </div>
            </div>
            <div className={cx('modal-footer', theme.backgrounds.body)}>
              <a href='#!' onClick={this.confirmNewInstance.bind(this, creatingInstance)} className={cx(
                'modal-action btn-flat',
                { 'waves-effect waves-green': animationLevel >= 3 }
              )}><Icon left>check</Icon> Ok</a>

              <a href='#!' onClick={this.cancelNewInstance.bind(this, creatingInstance)} className={cx(
                'modal-action btn-flat',
                { 'waves-effect waves-red': animationLevel >= 3 }
              )}><Icon left>clear</Icon> Cancel</a>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  valueChanged (event) {
    const currentId = event.target.value
    const type = this.state.types.find((type) => type.id === currentId)
    if (type) {
      type.onClick()
    } else {
      this.setState({ currentId })
      return this.props.onChange(currentId)
    }
  }

  confirmNewInstance (creatingInstance) {
    this.props.scenariiService.setActionInstance(creatingInstance)
    .then(() => {
      const instances = [...this.state.instances, creatingInstance]
      $(`#actions-dropdown-modal-${this.props.dropdownId}`).modal('close')
      $(`#actions-dropdown-modal-${this.props.dropdownId}`).detach().appendTo(`#actions-dropdown-modal-anchor-${this.props.dropdownId}`)
      this.setState({ instances, currentId: creatingInstance.instanceId, creatingInstance: null })
      this.props.onChange(creatingInstance.instanceId)
    })
  }

  cancelNewInstance (creatingInstance) {
    $(`#actions-dropdown-modal-${this.props.dropdownId}`).modal('close')
    $(`#actions-dropdown-modal-${this.props.dropdownId}`).detach().appendTo(`#actions-dropdown-modal-anchor-${this.props.dropdownId}`)
    setTimeout(() => {
      this.setState({
        creatingInstance: null
      })
    }, 250)
    this._editFormInstance = null
  }
}

ActionsDropdown.propTypes = {
  scenariiService: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  defaultActionId: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  dropdownId: PropTypes.string
}

ActionsDropdown.defaultProps = {
  defaultActionId: null,
  dropdownId: '0'
}

export default ActionsDropdown
