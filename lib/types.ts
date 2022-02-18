import type { Application, HookContext, Params } from '@feathersjs/feathers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyData = Record<string, any>

export type SingleGraphPopulateParams =
  | Params
  | ((params?: Params, context?: HookContext) => void | Params)
  | ((params?: Params, context?: HookContext) => void | Promise<Params>)

export type GraphPopulateParams = SingleGraphPopulateParams | SingleGraphPopulateParams[]

export interface PopulateObject<S = string> {
  service: S
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

export type NestedQuery = Record<string, AnyData>

export type Populates<S = string> = Record<string, PopulateObject<S>>

export interface GraphPopulateHookOptions<S = string> {
  populates: Populates<S>
}

export interface PopulateHookOptions<S = string> {
  populates: Populates<S>
  namedQueries?: AnyData
  defaultQueryName?: string
}

export interface GetPopulateQueryOptions {
  context: HookContext
  namedQueries: AnyData
  defaultQueryName: string
}

export interface PopulateUtilOptions<S = string> {
  app: Application
  params: Params
  populates: Populates<S>
}

export type GraphPopulateHook =
  | ((params?: Params, context?: HookContext) => void | Params)
  | ((params?: Params, context?: HookContext) => void | Promise<Params>)

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InitOptions {}

export type Method = 'find' | 'get' | 'create' | 'update' | 'patch' | 'remove'
export type Type = 'before' | 'after' | 'error'

export type GraphPopulateHookMap = {
  [key in Method | 'all']?: SingleGraphPopulateParams[]
}

export type GraphPopulateHooksObject = {
  [key in Type]?: GraphPopulateHookMap
}

export interface ShallowPopulateOptions {
  include: PopulateObject | PopulateObject[]
  catchOnError?: boolean
}

export interface ChainedParamsOptions {
  thisKey?: AnyData | undefined
  skipWhenUndefined?: boolean
}

export interface CumulatedRequestResult {
  include: PopulateObject
  params?: Params
  response?: { data: AnyData[] } | AnyData[]
}
