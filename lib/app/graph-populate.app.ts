import { Application } from '@feathersjs/feathers'
import { GraphPopulateApplication } from './graph-populate.class'
import serviceMixin from './graph-populate.service-mixin'

declare module '@feathersjs/feathers' {
  interface Application {
    'graphPopulate': GraphPopulateApplication;
  }
}

export default function init(app: Application): void {
  const graphPopulate = new GraphPopulateApplication(app)

  app.graphPopulate = graphPopulate

  app.mixins.push(serviceMixin)
}
