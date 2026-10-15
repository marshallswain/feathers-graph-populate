import type { Application, HookContext, Params } from '@feathersjs/feathers'
import type { AnyData, PopulateObject } from '../types.js'
import { chainedParams } from './chained-params.js'
import { noRelation } from './no-relation.js'
import { set } from './object.js'
import { toArray } from './to-array.js'

export async function makeRequestPerItem(
  item: AnyData,
  app: Application,
  include: PopulateObject,
  context: HookContext,
): Promise<void> {
  const { nameAs, asArray } = include
  const paramsFromInclude = toArray(include.params)

  const paramsOptions = {
    thisKey: item,
    skipWhenUndefined: true,
  }

  const service = app.service(include.service)

  const target = {
    path: include.service,
    service,
  }

  const params = await chainedParams(
    [{ paginate: false } as Params, ...paramsFromInclude],
    context,
    target,
    paramsOptions,
  )

  if (!params) {
    set(item, nameAs, noRelation(include))

    return
  }
  const relatedItems = await service.find(params)

  if (asArray) {
    set(item, nameAs, relatedItems)
  } else {
    const relatedItem = relatedItems.length > 0 ? relatedItems[0] : null
    set(item, nameAs, relatedItem)
  }
}
