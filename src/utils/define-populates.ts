import type { Populates } from '../types'

export const definePopulates = <S = string>(
  populates: Populates<S>,
): Populates<S> => {
  return populates
}
