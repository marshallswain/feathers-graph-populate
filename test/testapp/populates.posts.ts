export const populates = {
  author: {
    service: 'users',
    nameAs: 'author',
    keyHere: 'authorId',
    keyThere: 'id',
    asArray: false,
    params: {},
  },
  comments: {
    service: 'comments',
    nameAs: 'comments',
    keyHere: 'id',
    keyThere: 'postId',
    asArray: true,
    params: {},
  },
}

export const namedQueries = {}

export const whitelist = ['title']
