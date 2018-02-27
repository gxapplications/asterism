'use strict'

import ServerProcedure from './procedure/server'
import schemaProcedure from './procedure/schema'

import ServerLevelState from './level-state/server'
import schemaLevelState from './level-state/schema'

import ServerLevelStateChanger from './level-state-changer/server'
import schemaLevelStateChanger from './level-state-changer/schema'

const baseElementTypes = ({ logger, scenariiService }) => {
  ServerLevelStateChanger.logger = logger
  ServerLevelStateChanger.scenariiService = scenariiService
  return [
    { id: 'level-state', serverClass: ServerLevelState, dataSchema: schemaLevelState },
    { id: 'base-procedure', serverClass: ServerProcedure, dataSchema: schemaProcedure },
    { id: 'level-state-changer', serverClass: ServerLevelStateChanger, dataSchema: schemaLevelStateChanger }
    // { id: 'base-combination', serverClass: Object, dataSchema: {} } // TODO !3
  ]
}

export default baseElementTypes
