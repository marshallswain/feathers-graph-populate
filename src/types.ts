import type { Application, HookContext, Params } from '@feathersjs/feathers'

export type AnyData = Record<string, any>

export type SingleGraphPopulateParams =
  | Params
  | ((params?: Params, context?: HookContext) => void | Params)
  | ((params?: Params, context?: HookContext) => void | Promise<Params>)

export type GraphPopulateParams =
  | SingleGraphPopulateParams
  | SingleGraphPopulateParams[]

export interface IncludeShared<S = string> {
  service: S
  nameAs: string
  requestPerItem?: boolean
  asArray?: boolean
  catchOnError?: boolean
  params?: GraphPopulateParams
}

export interface IncludeCumulated<S = string> extends IncludeShared<S> {
  keyHere: string
  keyThere: string
}

export type PopulateObject<S = string> = IncludeCumulated<S> | IncludeShared<S>

export interface PopulateParams {
  name?: string
  query?: NestedQuery
}

export type NestedQuery = Record<string, AnyData>

export type Populates<S = string> = Record<string, PopulateObject<S>>

export interface PopulateUtilOptions<S = string> {
  app: Application
  params: Params
  populates: Populates<S>
}

export type GraphPopulateHook =
  | ((params?: Params, context?: HookContext) => void | Params)
  | ((params?: Params, context?: HookContext) => void | Promise<Params>)

export interface InitOptions {
  allowUnnamedQueryForExternal?: boolean
}

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
  include: IncludeCumulated
  params?: Params
  response?: AnyData[]
}
