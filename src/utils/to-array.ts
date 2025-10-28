type RemoveUndefined<T> = T extends undefined ? never : T

export const toArray = <T>(value: T | T[]): RemoveUndefined<T>[] => {
  if (value == null) {
    // null or undefined
    return []
  }

  return Array.isArray(value) ? (value as any) : [value]
}
