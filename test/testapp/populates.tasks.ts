export const populates = {
  users: {
    service: 'users',
    nameAs: 'users',
    keyHere: 'ownerIds',
    keyThere: 'id',
    asArray: true,
    params: {},
  },
  childTasks: {
    service: 'tasks',
    nameAs: 'childTasks',
    keyHere: 'childTaskIds',
    keyThere: 'id',
    asArray: true,
    params: {},
  },
}
