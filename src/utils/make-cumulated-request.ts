import type { Application, HookContext, Id, Params } from '@feathersjs/feathers'
import type { CumulatedRequestResult, IncludeCumulated } from '../types.js'
import { chainedParams } from './chained-params.js'
import { toArray } from './to-array.js'

export type CumulatedIncludeAndIds = { include: IncludeCumulated; ids: Id[] }

export async function makeCumulatedRequest(
  app: Application,
  { include, ids }: CumulatedIncludeAndIds,
  context: HookContext,
): Promise<CumulatedRequestResult> {
  const { keyThere } = include

  let params = {
    query: {
      [keyThere!]: ids.length === 1 ? ids[0] : { $in: ids },
    },
    paginate: false,
  } as Params

  const service = app.service(include.service)

  const target = {
    path: include.service,
    service,
  }

  params = (await chainedParams(
    [params, ...toArray(include.params)],
    context,
    target,
  )) as Params

  // modify params & rm $skip & $m $limit

  const { $skip, $limit, ...query } = params.query ? { ...params.query } : {}

  // if $select hasn't ${keyThere} add it and delete it afterwards
  if (query.$select && !query.$select.includes(keyThere)) {
    query.$select = [...query.$select, keyThere]
  }

  const response = await service.find({ ...params, query })

  return {
    include,
    params,
    response,
  }
}
