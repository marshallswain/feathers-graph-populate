const populates = {
  author: {
    service: 'users',
    nameAs: 'author',
    keyHere: 'authorId',
    keyThere: '_id',
    asArray: false,
    params: {},
  },
  comments: {
    service: 'comments',
    nameAs: 'comments',
    keyHere: '_id',
    keyThere: 'postId',
    asArray: true,
    params: {},
  },
};

const namedQueries = {};

module.exports = {
  populates,
  namedQueries,
  defaultQueryName: undefined,
  whitelist: ['title']
}
