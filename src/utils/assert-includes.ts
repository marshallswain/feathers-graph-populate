import type { Params } from '@feathersjs/feathers'
import type { PopulateObject } from '../types.js'

const requiredIncludeAttrs = ['service', 'nameAs', 'asArray', 'params']

const isDynamicParams = (
  params: Params | Params[] | (() => any) | undefined,
): boolean => {
  if (!params) return false
  if (Array.isArray(params)) {
    return params.some((p) => isDynamicParams(p))
  } else {
    return typeof params === 'function' || Object.keys(params).length > 0
  }
}

const describeInclude = (
  include: Partial<PopulateObject>,
  index: number,
): string => {
  const nameAs = include.nameAs ? `nameAs="${include.nameAs}"` : null
  const service = include.service ? `service="${include.service}"` : null
  const parts = [nameAs, service].filter(Boolean).join(' ')
  return parts ? `${parts} (index ${index})` : `index ${index}`
}

export const assertIncludes = (includes: PopulateObject[]): void => {
  includes.forEach((include, index) => {
    const isDynamic = isDynamicParams(include.params)

    const requiredAttrs = isDynamic
      ? requiredIncludeAttrs
      : [...requiredIncludeAttrs, 'keyHere', 'keyThere']

    requiredAttrs.forEach((attr) => {
      if (!(attr in include)) {
        throw new Error(
          `shallowPopulate hook: include ${describeInclude(include, index)} is missing required attribute \`${attr}\`. Every include must contain \`service\`, \`nameAs\` and (\`keyHere\` and \`keyThere\`) or \`params\`.`,
        )
      }
    })

    if (
      isDynamic &&
      ((!('keyHere' in include) && 'keyThere' in include) ||
        ('keyHere' in include && !('keyThere' in include)))
    ) {
      throw new Error(
        `shallowPopulate hook: include ${describeInclude(include, index)} defines only one of \`keyHere\`/\`keyThere\`. Both must be set together.`,
      )
    }
  })

  const seen = new Map<string, number>()
  includes.forEach((include, index) => {
    const previous = seen.get(include.nameAs)
    if (previous !== undefined) {
      throw new Error(
        `shallowPopulate hook: duplicate \`nameAs="${include.nameAs}"\` at index ${index} (first defined at index ${previous}). Every include must have a unique \`nameAs\`.`,
      )
    }
    seen.set(include.nameAs, index)
  })
}
