'use strict'

import ServerLevelState from './level-state/server'
import schemaLevelState from './level-state/schema'

import ServerBitmaskState from './bitmask-state/server'
import schemaBitmaskState from './bitmask-state/schema'

import ServerProcedure from './procedure/server'
import schemaProcedure from './procedure/schema'

import ServerLevelStateChanger from './level-state-changer/server'
import schemaLevelStateChanger from './level-state-changer/schema'

import ServerWait from './wait/server'
import schemaWait from './wait/schema'

import ServerActionAborter from './action-aborter/server'
import schemaActionAborter from './action-aborter/schema'

import ServerActionableScenario from './actionable-scenario/server'
import schemaActionableScenario from './actionable-scenario/schema'

import ServerThermostatStateScenario from './thermostat-state-scenario/server'
import schemaThermostatStateScenario from './thermostat-state-scenario/schema'

import ServerScenarioActivator from './scenario-activator/server'
import schemaScenarioActivator from './scenario-activator/schema'

import ServerScenarioAborter from './scenario-aborter/server'
import schemaScenarioAborter from './scenario-aborter/schema'

import ServerTimeBasedTrigger from './time-based-trigger/server'
import schemaTimeBasedTrigger from './time-based-trigger/schema'

import ServerAstralTimeTrigger from './astral-time-trigger/server'
import schemaAstralTimeTrigger from './astral-time-trigger/schema'

import ServerLevelStateTrigger from './level-state-trigger/server'
import schemaLevelStateTrigger from './level-state-trigger/schema'

import ServerTimeBasedCondition from './time-based-condition/server'
import schemaTimeBasedCondition from './time-based-condition/schema'

import ServerAstralTimeCondition from './astral-time-condition/server'
import schemaAstralTimeCondition from './astral-time-condition/schema'

import ServerLevelStateCondition from './level-state-condition/server'
import schemaLevelStateCondition from './level-state-condition/schema'

import ServerBitmaskStateChanger from './bitmask-state-changer/server'
import schemaBitmaskStateChanger from './bitmask-state-changer/schema'

import ServerBitmaskStateCondition from './bitmask-state-condition/server'
import schemaBitmaskStateCondition from './bitmask-state-condition/schema'

import ServerBitmaskStateTrigger from './bitmask-state-trigger/server'
import schemaBitmaskStateTrigger from './bitmask-state-trigger/schema'

import ServerWebPushNotificator from './web-push-notificator/server'
import schemaWebPushNotificator from './web-push-notificator/schema'

const baseElementTypes = ({ logger, scenariiService, dataHandler, notificationHandler }) => {
  ServerProcedure.scenariiService = scenariiService
  ServerLevelStateChanger.logger = logger
  ServerLevelStateChanger.scenariiService = scenariiService
  ServerActionAborter.logger = logger
  ServerActionAborter.scenariiService = scenariiService
  ServerActionableScenario.logger = logger
  ServerActionableScenario.scenariiService = scenariiService
  ServerThermostatStateScenario.logger = logger
  ServerThermostatStateScenario.scenariiService = scenariiService
  ServerScenarioActivator.logger = logger
  ServerScenarioActivator.scenariiService = scenariiService
  ServerScenarioAborter.logger = logger
  ServerScenarioAborter.scenariiService = scenariiService
  ServerTimeBasedTrigger.logger = logger
  ServerAstralTimeTrigger.scenariiService = scenariiService
  ServerAstralTimeTrigger.logger = logger
  ServerAstralTimeTrigger.dataHandler = dataHandler
  ServerLevelStateTrigger.scenariiService = scenariiService
  ServerLevelStateTrigger.logger = logger
  ServerTimeBasedCondition.logger = logger
  ServerAstralTimeCondition.logger = logger
  ServerAstralTimeCondition.dataHandler = dataHandler
  ServerLevelStateCondition.logger = logger
  ServerLevelStateCondition.scenariiService = scenariiService
  ServerBitmaskStateChanger.logger = logger
  ServerBitmaskStateChanger.scenariiService = scenariiService
  ServerBitmaskStateCondition.logger = logger
  ServerBitmaskStateCondition.scenariiService = scenariiService
  ServerBitmaskStateTrigger.logger = logger
  ServerBitmaskStateTrigger.scenariiService = scenariiService
  ServerWebPushNotificator.notificationHandler = notificationHandler
  ServerWebPushNotificator.logger = logger

  return [
    // States
    { id: 'level-state', serverClass: ServerLevelState, dataSchema: schemaLevelState },
    { id: 'bitmask-state', serverClass: ServerBitmaskState, dataSchema: schemaBitmaskState },

    // Actions
    { id: 'base-procedure', serverClass: ServerProcedure, dataSchema: schemaProcedure },
    { id: 'level-state-changer', serverClass: ServerLevelStateChanger, dataSchema: schemaLevelStateChanger },
    { id: 'base-wait', serverClass: ServerWait, dataSchema: schemaWait },
    { id: 'action-aborter', serverClass: ServerActionAborter, dataSchema: schemaActionAborter },
    { id: 'scenario-activator', serverClass: ServerScenarioActivator, dataSchema: schemaScenarioActivator },
    { id: 'scenario-aborter', serverClass: ServerScenarioAborter, dataSchema: schemaScenarioAborter },
    { id: 'bitmask-state-changer', serverClass: ServerBitmaskStateChanger, dataSchema: schemaBitmaskStateChanger },
    { id: 'web-push-notificator', serverClass: ServerWebPushNotificator, dataSchema: schemaWebPushNotificator },

    // Conditions
    { id: 'time-based-condition', serverClass: ServerTimeBasedCondition, dataSchema: schemaTimeBasedCondition },
    { id: 'astral-time-condition', serverClass: ServerAstralTimeCondition, dataSchema: schemaAstralTimeCondition },
    { id: 'level-state-condition', serverClass: ServerLevelStateCondition, dataSchema: schemaLevelStateCondition },
    { id: 'bitmask-state-condition', serverClass: ServerBitmaskStateCondition, dataSchema: schemaBitmaskStateCondition },
    // { id: 'base-combination', serverClass: Object, dataSchema: {} } // TODO !4

    // Triggers
    { id: 'time-based-trigger', serverClass: ServerTimeBasedTrigger, dataSchema: schemaTimeBasedTrigger },
    { id: 'astral-time-trigger', serverClass: ServerAstralTimeTrigger, dataSchema: schemaAstralTimeTrigger },
    { id: 'level-state-trigger', serverClass: ServerLevelStateTrigger, dataSchema: schemaLevelStateTrigger },
    { id: 'bitmask-state-trigger', serverClass: ServerBitmaskStateTrigger, dataSchema: schemaBitmaskStateTrigger },

    // Scenarii
    { id: 'actionable-scenario', serverClass: ServerActionableScenario, dataSchema: schemaActionableScenario },
    { id: 'thermostat-state-scenario', serverClass: ServerThermostatStateScenario, dataSchema: schemaThermostatStateScenario }
  ]
}

export default baseElementTypes
