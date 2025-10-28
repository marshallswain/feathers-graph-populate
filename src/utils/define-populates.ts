import type { Populates } from '../types.js'

export const definePopulates = <S = string>(
  populates: Populates<S>,
): Populates<S> => {
  return populates
}
