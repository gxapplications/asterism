'use strict'

import BrowserLevelState from './level-state/browser'
import schemaLevelState from './level-state/schema'

import BrowserProcedure from './procedure/browser'
import schemaProcedure from './procedure/schema'

import BrowserLevelStateChanger from './level-state-changer/browser'
import schemaLevelStateChanger from './level-state-changer/schema'

import BrowserWait from './wait/browser'
import schemaWait from './wait/schema'

const baseElementTypes = () => ([
  // States
  { id: 'level-state', browserClass: BrowserLevelState, dataSchema: schemaLevelState },

  // Actions
  { id: 'base-procedure', browserClass: BrowserProcedure, dataSchema: schemaProcedure },
  { id: 'level-state-changer', browserClass: BrowserLevelStateChanger, dataSchema: schemaLevelStateChanger },
  { id: 'base-wait', browserClass: BrowserWait, dataSchema: schemaWait }
  // TODO !3: abort all executions of another action

  // Conditions
  // TODO !3: "at the right moment": between XhXX and YhYY; on the X day of week;
  // { id: 'base-combination', browserClass: Object, dataSchema: {} } // TODO !4

  // Triggers

  // Scenarii
])

export default baseElementTypes
