export const populates = {
  members: {
    service: 'group-users',
    nameAs: 'members',
    keyHere: 'id',
    keyThere: 'groupId',
    asArray: true,
    params: {},
  },
  org: {
    service: 'orgs',
    nameAs: 'org',
    keyHere: 'orgId',
    keyThere: 'id',
    asArray: false,
    params: {},
  },
}
