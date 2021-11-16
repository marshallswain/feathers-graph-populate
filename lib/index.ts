import graphPopulate from './hooks/graph-populate.hook'
import populate from './hooks/populate.hook'
import getQuery from './utils/get-query'
import populateUtil from './utils/util.populate'

import shallowPopulate from './hooks/shallow-populate.hook'

import paramsForServer from './hooks/params-for-server.hook'
import paramsFromClient from './hooks/params-from-client.hook'

import initApp from './app/graph-populate.app'

export default initApp

export { definePopulates } from './utils/define-populates'

export {
  getQuery,
  graphPopulate,
  populate,
  populateUtil,
  shallowPopulate,
  paramsForServer,
  paramsFromClient
}
