export const populates = {
  members: {
    service: 'org-users',
    nameAs: 'members',
    keyHere: 'id',
    keyThere: 'orgId',
    asArray: true,
    params: {},
  },
  groups: {
    service: 'groups',
    nameAs: 'groups',
    keyHere: 'id',
    keyThere: 'orgId',
    asArray: true,
    params: {},
  },
}
