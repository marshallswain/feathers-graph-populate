import { Application } from '@feathersjs/feathers'
import { GraphPopulateApplication } from './graph-populate.class'
import serviceMixin from './graph-populate.service-mixin'

import { InitOptions } from '../types'

declare module '@feathersjs/feathers' {
  interface Application {
    'graphPopulate': GraphPopulateApplication;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function init(options?: InitOptions): ((app: Application) => void) {
  return (app: Application): void => {
    const graphPopulate = new GraphPopulateApplication(app)

    app.graphPopulate = graphPopulate

    app.mixins.push(serviceMixin)
  }
}
