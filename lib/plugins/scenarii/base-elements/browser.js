'use strict'

import BrowserLevelState from './level-state/browser'
import schemaLevelState from './level-state/schema'

import BrowserBitmaskState from './bitmask-state/browser'
import schemaBitmaskState from './bitmask-state/schema'

import BrowserProcedure from './procedure/browser'
import schemaProcedure from './procedure/schema'

import BrowserLevelStateChanger from './level-state-changer/browser'
import schemaLevelStateChanger from './level-state-changer/schema'

import BrowserWait from './wait/browser'
import schemaWait from './wait/schema'

import BrowserActionAborter from './action-aborter/browser'
import schemaActionAborter from './action-aborter/schema'

import BrowserActionableScenario from './actionable-scenario/browser'
import schemaActionableScenario from './actionable-scenario/schema'

import BrowserThermostatStateScenario from './thermostat-state-scenario/browser'
import schemaThermostatStateScenario from './thermostat-state-scenario/schema'

import BrowserScenarioActivator from './scenario-activator/browser'
import schemaScenarioActivator from './scenario-activator/schema'

import BrowserScenarioAborter from './scenario-aborter/browser'
import schemaScenarioAborter from './scenario-aborter/schema'

import BrowserTimeBasedTrigger from './time-based-trigger/browser'
import schemaTimeBasedTrigger from './time-based-trigger/schema'

import BrowserAstralTimeTrigger from './astral-time-trigger/browser'
import schemaAstralTimeTrigger from './astral-time-trigger/schema'

import BrowserLevelStateTrigger from './level-state-trigger/browser'
import schemaLevelStateTrigger from './level-state-trigger/schema'

import BrowserTimeBasedCondition from './time-based-condition/browser'
import schemaTimeBasedCondition from './time-based-condition/schema'

import BrowserAstralTimeCondition from './astral-time-condition/browser'
import schemaAstralTimeCondition from './astral-time-condition/schema'

import BrowserLevelStateCondition from './level-state-condition/browser'
import schemaLevelStateCondition from './level-state-condition/schema'

import BrowserBitmaskStateChanger from './bitmask-state-changer/browser'
import schemaBitmaskStateChanger from './bitmask-state-changer/schema'

import BrowserBitmaskStateCondition from './bitmask-state-condition/browser'
import schemaBitmaskStateCondition from './bitmask-state-condition/schema'

import BrowserBitmaskStateTrigger from './bitmask-state-trigger/browser'
import schemaBitmaskStateTrigger from './bitmask-state-trigger/schema'

const baseElementTypes = () => ([
  // States
  { id: 'level-state', browserClass: BrowserLevelState, dataSchema: schemaLevelState },
  { id: 'bitmask-state', browserClass: BrowserBitmaskState, dataSchema: schemaBitmaskState },

  // Actions
  { id: 'base-procedure', browserClass: BrowserProcedure, dataSchema: schemaProcedure },
  { id: 'level-state-changer', browserClass: BrowserLevelStateChanger, dataSchema: schemaLevelStateChanger },
  { id: 'base-wait', browserClass: BrowserWait, dataSchema: schemaWait },
  { id: 'action-aborter', browserClass: BrowserActionAborter, dataSchema: schemaActionAborter },
  { id: 'scenario-activator', browserClass: BrowserScenarioActivator, dataSchema: schemaScenarioActivator },
  { id: 'scenario-aborter', browserClass: BrowserScenarioAborter, dataSchema: schemaScenarioAborter },
  { id: 'bitmask-state-changer', browserClass: BrowserBitmaskStateChanger, dataSchema: schemaBitmaskStateChanger },

  // Conditions
  { id: 'time-based-condition', browserClass: BrowserTimeBasedCondition, dataSchema: schemaTimeBasedCondition },
  { id: 'astral-time-condition', browserClass: BrowserAstralTimeCondition, dataSchema: schemaAstralTimeCondition },
  { id: 'level-state-condition', browserClass: BrowserLevelStateCondition, dataSchema: schemaLevelStateCondition },
  { id: 'bitmask-state-condition', browserClass: BrowserBitmaskStateCondition, dataSchema: schemaBitmaskStateCondition },
  // { id: 'base-combination', browserClass: Object, dataSchema: {} } // TODO !4

  // Triggers
  { id: 'time-based-trigger', browserClass: BrowserTimeBasedTrigger, dataSchema: schemaTimeBasedTrigger },
  { id: 'astral-time-trigger', browserClass: BrowserAstralTimeTrigger, dataSchema: schemaAstralTimeTrigger },
  { id: 'level-state-trigger', browserClass: BrowserLevelStateTrigger, dataSchema: schemaLevelStateTrigger },
  { id: 'bitmask-state-trigger', browserClass: BrowserBitmaskStateTrigger, dataSchema: schemaBitmaskStateTrigger },

  // Scenarii
  { id: 'actionable-scenario', browserClass: BrowserActionableScenario, dataSchema: schemaActionableScenario },
  { id: 'thermostat-state-scenario', browserClass: BrowserThermostatStateScenario, dataSchema: schemaThermostatStateScenario }
])

export default baseElementTypes
