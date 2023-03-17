import type { HookContext } from '@feathersjs/feathers'

export function paramsFromClient(...whitelist: string[]): (context: HookContext) => HookContext {
  return (context: HookContext): HookContext => {
    const params = context.params

    if (
      params &&
      params.query &&
      params.query._$client &&
      typeof params.query._$client === 'object'
    ) {
      const client = params.query._$client

      whitelist.forEach((key) => {
        if (`_${key}` in client) {
          params[key] = client[`_${key}`]
        }
      })

      params.query = Object.assign({}, params.query)
      delete params.query._$client
    }

    return context
  }
}
