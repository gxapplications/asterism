'use strict'

import cx from 'classnames'
import Joi from 'joi'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Input, Row } from 'react-materialize'
import sortable from 'html5sortable/dist/html5sortable.es.js'
import uuid from 'uuid'
import { Scenarii } from 'asterism-plugin-library'

import schemaProcedure from './schema'

const { ActionsDropdown } = Scenarii

class BrowserProcedureEditForm extends React.Component {
  constructor (props) {
    super(props)

    this.defaultName = Joi.reach(schemaProcedure, 'name')._flags.default
    this.scenariiService = props.services()['asterism-scenarii']

    this.state = {
      deleteElementConfirm: null
    }
    this._mounted = false
  }

  componentDidMount () {
    this._mounted = true

    sortable('.procedurePanel ol', {
      items: ':not(.add)',
      handle: '.orderHandler',
      forcePlaceholderSize: true
    })[0].addEventListener('sortupdate', this.reorderSequence.bind(this))
  }

  componentWillUnmount () {
    this._mounted = false
  }

  componentDidUpdate (prevProps, prevState) {
    sortable('.procedurePanel ol', {
      items: ':not(.add)',
      handle: '.orderHandler',
      forcePlaceholderSize: true
    }).forEach((e) => e.addEventListener('sortupdate', this.reorderSequence.bind(this)))
  }

  render () {
    const { instance } = this.props
    const defaultValue = instance.data.name === this.defaultName ? '' : instance.data.name

    return (
      <div>
        <Row className='section card form hide-in-procedure'>
          <Input placeholder='Give a name to quickly identify your action' s={12} label='Name'
            defaultValue={defaultValue} onChange={(e) => { instance.data.name = e.currentTarget.value }} />
        </Row>

        <Row className='section procedurePanel'>
          {this.renderScript(instance.data.script)}
        </Row>
      </div>
    )
  }

  renderScript (script) {
    const waves = this.props.animationLevel >= 2 ? 'waves-effect waves-light' : undefined
    const deleteWaves = this.props.animationLevel >= 2 ? 'btn-flat waves-effect waves-red' : 'btn-flat'
    const deleteWavesConfirm = (this.props.animationLevel >= 2 ? 'btn waves-effect waves-light' : 'btn') + ` ${this.props.theme.actions.negative}`

    const sequences = Object.entries(script).map(([sequenceKey, sequence]) => this.renderSequence(sequence, sequenceKey))
    return (
      <ul className='script'>
        {sequences.map((sequence, idx) => (
          <li key={uuid.v4()}>
            <div className={cx('remove sequence', this.isDeleteSequenceConfirmation(sequence.props['data-sequenceKey'], script, idx) ? deleteWavesConfirm : deleteWaves)}
              onClick={this.deleteSequence.bind(this, script, idx, sequence.props['data-sequenceKey'])}>
              <i className='material-icons'>delete</i>
            </div>
            {sequence}
          </li>
        ))}
        {sequences.length < 32 ? (
          <li className={cx('add sequence', waves)} onClick={this.addSequence.bind(this, script)}><i className='material-icons'>add</i>Add a parallelized sequence</li>
        ) : null}
      </ul>
    )
  }

  renderSequence (sequence, key) {
    const { theme, animationLevel, instance, services } = this.props
    const waves = this.props.animationLevel >= 2 ? 'waves-effect waves-light' : undefined
    const deleteWaves = this.props.animationLevel >= 2 ? 'btn-flat waves-effect waves-red' : 'btn-flat'
    const deleteWavesConfirm = (this.props.animationLevel >= 2 ? 'btn waves-effect waves-light' : 'btn') + ` ${this.props.theme.actions.negative}`

    const scriptsOrActions = sequence.map((e, idx) => (typeof e !== 'string')
      ? [
        this.renderScript(e),
        <div className={cx('removeAction', this.isDeleteScriptConfirmation(e, sequence, idx) ? deleteWavesConfirm : deleteWaves)}
          onClick={this.deleteScript.bind(this, sequence, idx, e)}><i className='material-icons'>delete</i></div>,
        null
      ] : [
        this.renderAction(e),
        <div className={cx('removeAction', this.isDeleteActionConfirmation(e, sequence, idx) ? deleteWavesConfirm : deleteWaves)}
          onClick={this.deleteAction.bind(this, sequence, idx, e)}>
          <i className='material-icons'>{this.isActionGlobal(e) ? 'clear' : 'delete'}</i>
        </div>,
        this.isActionGlobal(e)
          ? <div className='globalizeAction disabled'><i className='material-icons'>public</i> Global action, cannot be edited here.</div>
          : <div className={cx('globalizeAction btn-flat', waves)} onClick={this.globalizeAction.bind(this, e)}>
            <i className='material-icons'>public</i>
          </div>
      ]
    )
    return (
      <ol data-sequenceKey={key}>
        {scriptsOrActions.map((scriptOrAction) => (
          <li key={uuid.v4()} >
            {scriptOrAction[0]}
            <div className='orderHandler'><i className='material-icons'>reorder</i></div>
            {scriptOrAction[1]}
            {scriptOrAction[2]}
          </li>
        ))}

        {scriptsOrActions.length < 32 ? (
          <li className='add action'>
            <ActionsDropdown onChange={this.addAction.bind(this, sequence)} theme={theme} animationLevel={animationLevel}
              services={services} parentIdForNewInstance={instance.instanceId} noCreationPanel
              typeFilter={(e) => e.id !== 'base-procedure'} instanceFilter={(e) => e.typeId !== 'base-procedure'}
              icon={null} label='Add an action' dropdownId={uuid.v4()} />
          </li>
        ) : null}
        {scriptsOrActions.length < 32 ? (
          <li className={cx('add script', waves)} onClick={this.addScript.bind(this, sequence)}><i className='material-icons'>add</i>Add a script</li>
        ) : null}
      </ol>
    )
  }

  addAction (sequence, actionId) {
    sequence.push(actionId)
    this.forceUpdate()
  }

  renderAction (actionId) {
    if (this.state[`actionEditPanel-${actionId}`] !== undefined) {
      const action = this.state[`actionEditPanel-${actionId}`]
      if (action) {
        const ActionEditForm = action.EditForm
        return (
          <ActionEditForm
            instance={this.state[`actionEditPanel-${actionId}`]} services={this.props.services}
            theme={this.props.theme} animationLevel={this.props.animationLevel} />
        )
      }

      // not found case
      return (
        <div className='section card red-text'>
          <Icon small>warning</Icon> <Icon small>healing</Icon>&nbsp;
          The action that was here seems to be missing. This avoid the procedure to be run properly, so you have to fix this.
        </div>
      )
    } else {
      this.scenariiService.getActionInstance(actionId, true)
      .then((action) => {
        this.setState({
          [`actionEditPanel-${actionId}`]: action || null // force null if undefined (not found)
        })
        this.props.instance.editedActions = this.props.instance.editedActions || {}
        this.props.instance.editedActions[actionId] = action
      })
      .catch((error) => {
        this.setState({
          [`actionEditPanel-${actionId}`]: null
        })
        console.error(error)
      })
      return null
    }
  }

  isActionGlobal (actionId) {
    const action = this.state[`actionEditPanel-${actionId}`]
    if (action && action.parent === this.props.instance.instanceId) {
      return false
    }

    return true // by default if not fetched yet
  }

  isDeleteActionConfirmation (actionId, sequence, idx) {
    const e = this.state.deleteElementConfirm
    return (e && e.length === 3 && e[0] === actionId && e[1] === sequence && e[2] === idx)
  }

  deleteAction (sequence, idx, actionId) {
    if (!this.isDeleteActionConfirmation(actionId, sequence, idx)) {
      this._deleteConfirm([actionId, sequence, idx])
      return
    }

    this._deleteConfirm(null)
    this._deleteAction(sequence, idx, actionId)
  }
  _deleteAction (sequence, idx, actionId) {
    sequence.splice(idx, 1) // removes 1 element from idx position

    const { ...newState } = this.state
    delete newState[`actionEditPanel-${actionId}`]
    this.setState(newState)
  }

  globalizeAction (actionId) {
    const action = this.state[`actionEditPanel-${actionId}`]
    if (action && action.parent === this.props.instance.instanceId) {
      action.parent = null
      this.scenariiService.setActionInstance(action, null)
      .then(() => this.forceUpdate())
    }
  }

  addScript (sequence) {
    sequence.push({ 'a': [] })
    this.forceUpdate()
  }

  isDeleteScriptConfirmation (script, sequence, idx) {
    const e = this.state.deleteElementConfirm
    return (e && e.length === 3 && e[0] === script && e[1] === sequence && e[2] === idx)
  }

  deleteScript (sequence, idx, script) {
    if (!this.isDeleteScriptConfirmation(script, sequence, idx)) {
      this._deleteConfirm([script, sequence, idx])
      return
    }

    this._deleteConfirm(null)
    this._deleteScript(sequence, idx)
    this.forceUpdate()
  }
  _deleteScript (sequence, idx) {
    const removedScript = sequence.splice(idx, 1)[0] // removes 1 element from idx position
    Object.entries(removedScript).map(([sequenceKey, sequence]) => this._deleteSequence(removedScript, sequenceKey))
  }

  addSequence (script) {
    const key = uuid.v4()
    script[key] = []
    this.forceUpdate()
  }

  isDeleteSequenceConfirmation (sequenceKey, script, idx) {
    const e = this.state.deleteElementConfirm
    return (e && e.length === 3 && e[0] === sequenceKey && e[1] === script && e[2] === idx)
  }

  deleteSequence (script, idx, sequenceKey) {
    if (!this.isDeleteSequenceConfirmation(sequenceKey, script, idx)) {
      this._deleteConfirm([sequenceKey, script, idx])
      return
    }

    this._deleteConfirm(null)
    this._deleteSequence(script, sequenceKey)
    this.forceUpdate()
  }
  _deleteSequence (script, sequenceKey) {
    const sequence = script[sequenceKey]
    sequence.forEach((scriptOrAction, i) => typeof scriptOrAction === 'string'
      ? this._deleteAction(sequence, i, scriptOrAction)
      : this._deleteScript(sequence, i))

    delete script[sequenceKey]
  }

  reorderSequence (event) {
    const detail = event.detail
    console.log('###', detail.startParent, detail.oldElementIndex, detail.elementIndex)
    // TODO !0: event handling here to store move (https://github.com/lukasoppermann/html5sortable)

    /*
     passage de idx 0 à 1:
     oldElementIndex: 0
     elementIndex: 2 (its a bug). Consider 1
     ==> if (oldElementIndex < elementIndex) { array.splice(elementIndex + 1, 0, e); array.splice(oldElementIndex, 1); } else { ??? }
    */
  }

  _deleteConfirm (element) {
    clearTimeout(this._deleteTimer)
    if (this.state.deleteElementConfirm !== element) {
      this.setState({
        deleteElementConfirm: element
      })
    }
    if (element) {
      this._deleteTimer = setTimeout(() => {
        if (this._mounted) {
          this.setState({ deleteElementConfirm: null })
        }
      }, 3000)
    }
  }
}

BrowserProcedureEditForm.propTypes = {
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  instance: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired
}

BrowserProcedureEditForm.label = 'Basic procedure'

export default BrowserProcedureEditForm
