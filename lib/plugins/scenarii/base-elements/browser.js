'use strict'

import BrowserProcedure from './procedure/browser'
import schemaProcedure from './procedure/schema'

import BrowserLevelState from './level-state/browser'
import schemaLevelState from './level-state/schema'

import BrowserLevelStateChanger from './level-state-changer/browser'
import schemaLevelStateChanger from './level-state-changer/schema'

const baseElementTypes = () => ([
  { id: 'level-state', browserClass: BrowserLevelState, dataSchema: schemaLevelState },
  { id: 'base-procedure', browserClass: BrowserProcedure, dataSchema: schemaProcedure },
  { id: 'level-state-changer', browserClass: BrowserLevelStateChanger, dataSchema: schemaLevelStateChanger }
  // { id: 'base-combination', browserClass: Object, dataSchema: {} } // TODO !3
])

export default baseElementTypes
