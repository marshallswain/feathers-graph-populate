import { Application, HookContext, Params } from '@feathersjs/feathers'

type SingleGraphPopulateParams =
  Params|
  ((params: Params, context: HookContext) => Params)|
  ((params: Params, context: HookContext) => Promise<Params>)

export type GraphPopulateParams =
  SingleGraphPopulateParams|SingleGraphPopulateParams[]

export interface PopulateObject {
  service: string
  nameAs: string
  keyHere?: string
  keyThere?: string
  asArray?: boolean
  requestPerItem?: boolean
  catchOnError?: boolean
  params?: GraphPopulateParams
}

export interface PopulateParams {
  name?: string
  query?: NestedQuery
}

export type NestedQuery = Record<string, Record<string, unknown>>

export type Populates = Record<string, PopulateObject>

export interface GraphPopulateHookOptions {
  populates: Populates
}

export interface PopulateHookOptions {
  populates: Populates
  namedQueries?: Record<string, unknown>
  defaultQueryName?: string
}

export interface GetPopulateQueryOptions {
  context: HookContext
  namedQueries: Record<string, unknown>
  defaultQueryName: string
}

export interface PopulateUtilOptions {
  app: Application
  params: Params
  populates: Populates
}
