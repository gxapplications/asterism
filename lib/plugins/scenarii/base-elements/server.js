'use strict'

import ServerProcedure from './procedure/server'
import schemaProcedure from './procedure/schema'

const baseElementTypes = () => ([
  { id: 'base-procedure', serverClass: ServerProcedure, dataSchema: schemaProcedure }
  // { id: 'base-combination', serverClass: Object, dataSchema: {} } // TODO !3
])

export default baseElementTypes
