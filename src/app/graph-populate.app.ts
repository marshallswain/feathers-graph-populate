import { GraphPopulateApplication } from './graph-populate.class'
import serviceMixin from './graph-populate.service-mixin'

import type { Application } from '@feathersjs/feathers'
import type { InitOptions } from '../types'

export function initApp(options?: InitOptions): (app: Application) => void {
  return (app: Application): void => {
    const graphPopulate = new GraphPopulateApplication(app, options)

    ;(app as any).graphPopulate = graphPopulate

    app.mixins.push(serviceMixin)
  }
}
