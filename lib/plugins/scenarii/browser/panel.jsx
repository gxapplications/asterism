'use strict'

/* global $ */
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Autocomplete, Icon, Modal, Tab, Tabs } from 'react-materialize'

import PanelList from './panel-list'

import styles from '../scenarii.scss'

class ScenariiEditPanel extends React.Component {
  constructor (props) {
    super(props)

    this._tabs = [ null, null, null, null, null ]
    this._editInstance = null
    this.scenariiService = props.services()['asterism-scenarii']
    this._socket = props.privateSocket

    this.state = {
      EditForm: null,
      supportGroup: false,
      currentGroupName: '',
      currentTab: 0
    }

    this._listenerId = null
    this._groups = {}
  }

  componentDidMount () {
    this._listenerId = this.scenariiService.addScenariiListener((event, instance) => {
      switch (event) {
        case 'scenarioActivationChanged':
          if (this._tabs[0]) {
            this._tabs[0].forceUpdate()
          }
      }
    })

    this._socket.on('stateChanged', (instance) => {
      if (this._tabs[4]) {
        this._tabs[4].forceUpdate()
      }
    })

    this.fetchGroups()
    // TODO !0: ici ou pas, il faut décaler le title sur l'autocomplete
  }

  componentWillUnmount () {
    if (this._listenerId) {
      this.scenariiService.removeScenariiListener(this._listenerId)
      delete this._listenerId
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (this.state.EditForm !== nextState.EditForm)
  }

  render () {
    const { theme, animationLevel, services, highlightCloseButton } = this.props
    const { EditForm, supportGroup, currentTab, currentGroupName } = this.state
    return (
      <div id='scenarii-edit-panel' className={cx({ 'editFormOpened': !!EditForm }, 'ScenariiEditPanel', styles.ScenariiEditPanel)}>
        <Tabs onChange={this.tabChanged.bind(this)} className={theme.backgrounds.editing}>
          <Tab title={<span><Icon left>offline_pin</Icon><span className='hide-on-small-only'>Scenarii</span></span>} active={currentTab === 0}>
            <PanelList theme={theme} animationLevel={animationLevel}
              getInstances={this.scenariiService.getScenarioInstances.bind(this.scenariiService)}
              getTypes={this.scenariiService.getScenarioTypes.bind(this.scenariiService)}
              createInstance={this.scenariiService.createScenarioInstance.bind(this.scenariiService)}
              deleteInstance={this.scenariiService.deleteScenarioInstance.bind(this.scenariiService)}
              testInstance={this.scenariiService.forceTriggerScenarioInstance.bind(this.scenariiService)}
              abortInstance={this.scenariiService.forceAbortScenarioInstance.bind(this.scenariiService)}
              activateInstance={this.scenariiService.setActivationScenarioInstance.bind(this.scenariiService)}
              applyEditForm={this.applyEditForm.bind(this)}
              ref={(c) => { this._tabs[0] = c }}>
              <div className='collection-header'>
                <Icon>offline_pin</Icon>
                No scenario yet.<br /><br />
                A scenario is a complex structure you can trigger or (de)activate.<br />
                Most common scenario will be triggered by an event to run an action.<br />
                You can add one choosing a scenario type below.
              </div>
            </PanelList>
          </Tab>
          <Tab title={<span><Icon left>help</Icon><span className='hide-on-small-only'>Conditions</span></span>} active={currentTab === 1}>
            <PanelList theme={theme} animationLevel={animationLevel}
              getInstances={this.scenariiService.getConditionInstances.bind(this.scenariiService)}
              getTypes={this.scenariiService.getConditionTypes.bind(this.scenariiService)}
              createInstance={this.scenariiService.createConditionInstance.bind(this.scenariiService)}
              deleteInstance={this.scenariiService.deleteConditionInstance.bind(this.scenariiService)}
              testInstance={this.scenariiService.testConditionInstance.bind(this.scenariiService)}
              applyEditForm={this.applyEditForm.bind(this)}
              ref={(c) => { this._tabs[1] = c }}>
              <div className='collection-header'>
                <Icon>help</Icon>
                No condition yet.<br /><br />
                A condition is a configured test you can use in a scenario to run an action or not.<br />
                You can add one choosing a condition type below.
              </div>
            </PanelList>
          </Tab>
          <Tab title={<span><Icon left>error</Icon><span className='hide-on-small-only'>Actions</span></span>} active={currentTab === 2}>
            <PanelList theme={theme} animationLevel={animationLevel}
              getInstances={this.scenariiService.getActionInstances.bind(this.scenariiService)}
              getTypes={this.scenariiService.getActionTypes.bind(this.scenariiService)}
              createInstance={this.scenariiService.createActionInstance.bind(this.scenariiService)}
              deleteInstance={this.scenariiService.deleteActionInstance.bind(this.scenariiService)}
              testInstance={this.scenariiService.executeActionInstance.bind(this.scenariiService)}
              abortInstance={this.scenariiService.abortActionInstance.bind(this.scenariiService)}
              applyEditForm={this.applyEditForm.bind(this)} supportGroups
              ref={(c) => { this._tabs[2] = c }}>
              <div className='collection-header'>
                <Icon>error</Icon>
                No action yet.<br /><br />
                An action is a configured intent you can trigger via a button, a dashboard item or a scenario.<br />
                You can add one choosing an action type below.
              </div>
            </PanelList>
          </Tab>
          <Tab title={<span><Icon left>play_circle_filled</Icon><span className='hide-on-small-only'>Triggers</span></span>} active={currentTab === 3}>
            <PanelList theme={theme} animationLevel={animationLevel}
              getInstances={this.scenariiService.getTriggerInstances.bind(this.scenariiService)}
              getTypes={this.scenariiService.getTriggerTypes.bind(this.scenariiService)}
              createInstance={this.scenariiService.createTriggerInstance.bind(this.scenariiService)}
              deleteInstance={this.scenariiService.deleteTriggerInstance.bind(this.scenariiService)}
              applyEditForm={this.applyEditForm.bind(this)}
              ref={(c) => { this._tabs[3] = c }}>
              <div className='collection-header'>
                <Icon>play_circle_filled</Icon>
                No trigger yet.<br /><br />
                A trigger is a configured event you can use in a scenario to launch the scenario.<br />
                You can add one choosing a trigger type below.
              </div>
            </PanelList>
          </Tab>
          <Tab title={<span><Icon left>monetization_on</Icon><span className='hide-on-small-only'>States</span></span>} active={currentTab === 4}>
            <PanelList theme={theme} animationLevel={animationLevel}
              getInstances={this.scenariiService.getStateInstances.bind(this.scenariiService)}
              getTypes={this.scenariiService.getStateTypes.bind(this.scenariiService)}
              createInstance={this.scenariiService.createStateInstance.bind(this.scenariiService)}
              deleteInstance={this.scenariiService.deleteStateInstance.bind(this.scenariiService)}
              applyEditForm={this.applyEditForm.bind(this)}
              ref={(c) => { this._tabs[4] = c }}>
              <div className='collection-header'>
                <Icon>monetization_on</Icon>
                No state yet.<br /><br />
                A state is like a variable that can be changed by actions.<br />
                When a state changes, it sends an event for other elements.<br />
                You can add one choosing an state type below.
              </div>
            </PanelList>
          </Tab>
        </Tabs>
        <div className={cx('editForm', theme.backgrounds.body)}>
          {EditForm && supportGroup && <div className='right section group'><Autocomplete placeholder='Unclassified' title='Group' options={{
            data: this._groups,
            limit: 64,
            minLength: 2,
            onAutocomplete: this.groupAutocompleted.bind(this)
          }} onChange={this.groupChanged.bind(this)} value={currentGroupName} /></div>}
          {EditForm && <h5 className='title'>{EditForm.label} - Edition</h5>}
          {EditForm &&
            <EditForm ref={(c) => { this._editFormInstance = c }}
              instance={this._editInstance} services={services}
              theme={theme} animationLevel={animationLevel}
              highlightCloseButton={highlightCloseButton}
              privateSocket={this._socket}
            />
          }
        </div>

        <Modal id='scenarii-persistence-error-modal'
          header='Persistence error'>
          <p>No message</p>
        </Modal>
      </div>
    )
  }

  tabChanged (href) {
    $(`#scenarii-edit-panel > ul.tabs > li.tab > a[href^='#']`).each((idx, el) => {
      if ($(el).attr('href') === `#tab_${href}`) {
        this.setState({ currentTab: idx })
        setTimeout(() => {
          $(`#scenarii-edit-panel > div.row > div:eq(${idx}) .search input`).focus()
        }, 300)
      }
    })
  }

  saveInstance (instance) {
    const group = this.state.currentGroupName || undefined
    const save = (instance.presave) ? instance.presave(this.props.services).then(() => instance.save(undefined, group)) : instance.save(undefined, group)
    return save
    .catch((error) => {
      $('#scenarii-persistence-error-modal p').html(error ? error.message : 'Unknown error saving element!')
      $('#scenarii-persistence-error-modal').modal('open')
    })
    .then(() => {
      this._tabs[0].forceUpdate && this._tabs[0].forceUpdate()
      this._tabs[this.state.currentTab].forceUpdate && this._tabs[this.state.currentTab].forceUpdate()
      this._editInstance = null
      if (this.state.EditForm) {
        this.setState({
          EditForm: null,
          currentGroupName: ''
        })
        setTimeout(() => {
          $(`#scenarii-edit-panel > div.row > div:eq(${this.state.currentTab}) .search input`).focus()
        }, 300)
      }
      this.fetchGroups()
    })
    .then(() => true) // modal will not close now
  }

  applyEditForm (instance, supportGroup) {
    if (instance.EditForm) {
      this.fetchGroups()
      // open the EditForm sliding card
      this._editInstance = instance
      this.setState({
        EditForm: instance.EditForm,
        supportGroup,
        currentGroupName: instance.group
      })
    } else {
      // directly save the instance, and refresh list
      this.saveInstance(instance)
    }
  }

  handleCloseButton () {
    if (!this.state.EditForm) {
      // do not handle close button event: modal will close
      return Promise.reject(false) // eslint-disable-line prefer-promise-reject-errors
    }

    // try to save first, then close editForm sliding card: modal will not close now
    if (this._editFormInstance && this._editFormInstance.handleCloseButton) {
      return this._editFormInstance.handleCloseButton()
      .then(() => this.saveInstance(this._editInstance))
    } else {
      return this.saveInstance(this._editInstance)
    }
  }

  fetchGroups () {
    return Promise.all([
      this.scenariiService.getActionInstances(),
      this.scenariiService.getConditionInstances(),
      this.scenariiService.getTriggerInstances(),
      this.scenariiService.getScenarioInstances()
    ])
    .then(([actions, conditions, triggers, scenarios]) => {
      actions.forEach(i => { this._groups[i.group] = null })
      conditions.forEach(i => { this._groups[i.group] = null })
      triggers.forEach(i => { this._groups[i.group] = null })
      scenarios.forEach(i => { this._groups[i.group] = null })
    })
  }

  groupChanged (event) {
    const groupName = event.currentTarget.value.trim() || ''
    this.setState({
      currentGroupName: groupName
    })
    this.props.highlightCloseButton()
  }

  groupAutocompleted (groupName) {
    this.setState({
      currentGroupName: groupName
    })
    this.props.highlightCloseButton()
  }
}

ScenariiEditPanel.propTypes = {
  serverStorage: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  animationLevel: PropTypes.number.isRequired,
  localStorage: PropTypes.object.isRequired,
  services: PropTypes.func.isRequired,
  highlightCloseButton: PropTypes.func
}

ScenariiEditPanel.defaultProps = {
  highlightCloseButton: () => {}
}

ScenariiEditPanel.label = 'Scenarii settings'
ScenariiEditPanel.icon = 'playlist_play'
ScenariiEditPanel.extendHeader = true

ScenariiEditPanel.onOpenStart = (theme) => {
  $('#scenarii-edit-panel > ul.tabs').tabs('updateTabIndicator')
}
ScenariiEditPanel.onOpenEnd = (theme) => {
  $('#scenarii-edit-panel > ul.tabs').tabs('updateTabIndicator')
  $('#scenarii-edit-panel > div.row > div:eq(0) .search input').focus()
}

export default ScenariiEditPanel
