import { Application, HookContext, Params } from '@feathersjs/feathers'

export type SingleGraphPopulateParams =
  Params|
  ((params?: Params, context?: HookContext) => void | Params) |
  ((params?: Params, context?: HookContext) => void | Promise<Params>)

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

export type GraphPopulateHook =
  ((params?: Params, context?: HookContext) => void | Params) |
  ((params?: Params, context?: HookContext) => void | Promise<Params>)

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InitOptions {}

export type Method = 'find' | 'get' | 'create' | 'update' | 'patch' | 'remove'
export type Type = 'before' | 'after' | 'error'

export interface GraphPopulateHookMap {
  all: SingleGraphPopulateParams[];
  find: SingleGraphPopulateParams[];
  get: SingleGraphPopulateParams[];
  create: SingleGraphPopulateParams[];
  update: SingleGraphPopulateParams[];
  patch: SingleGraphPopulateParams[];
  remove: SingleGraphPopulateParams[];
}

export interface GraphPopulateHooksObject {
  before: GraphPopulateHookMap;
  after: GraphPopulateHookMap;
  error: GraphPopulateHookMap;
}

export interface ShallowPopulateOptions {
  include: PopulateObject | PopulateObject[]
  catchOnError?: boolean
}

export interface ChainedParamsOptions {
  thisKey?: Record<string, unknown> | undefined
  skipWhenUndefined?: boolean
}

export interface CumulatedRequestResult {
  include: PopulateObject,
  params?: Params,
  response?: { data: Record<string, unknown>[] } | Record<string, unknown>[]
}
