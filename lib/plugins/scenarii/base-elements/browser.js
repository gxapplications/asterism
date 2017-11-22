'use strict'

import BrowserProcedure from './procedure/browser'
import schemaProcedure from './procedure/schema'

const baseElementTypes = () => ([
  { id: 'base-procedure', browserClass: BrowserProcedure, dataSchema: schemaProcedure }
  // { id: 'base-combination', browserClass: Object, dataSchema: {} } // TODO !3
])

export default baseElementTypes
