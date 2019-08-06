/**
 * This is a modified version of shallow populate that supports Arrays of nested objects for keyThere fields.
 */
const assert = require('assert')
const { getByDot, setByDot } = require('feathers-hooks-common')
const defaults = {
  include: undefined
}

module.exports = function (options) {
  options = Object.assign({}, defaults, options)

  // Make an array of includes
  const includes = [].concat(options.include || [])

  if (!includes.length) {
    throw new Error('shallowPopulate hook: You must provide one or more relationships in the `include` option.')
  }

  const requiredIncludeAttrs = [
    'service',
    'nameAs',
    'keyHere',
    'keyThere',
    'asArray',
    'params'
  ]
  includes.forEach(include => {
    // Create default `asArray` property
    if (!Object.prototype.hasOwnProperty.call(include, 'asArray')) {
      include.asArray = true
    }
    // Create default `params` property
    if (!Object.prototype.hasOwnProperty.call(include, 'params')) {
      include.params = {}
    }
    try {
      assert.deepStrictEqual(requiredIncludeAttrs.sort(), Object.keys(include).sort())
    } catch (error) {
      throw new Error('shallowPopulate hook: Every `include` must contain `service`, `nameAs`, `keyHere`, and `keyThere` properties')
    }
  })

  const requiredKeyMappings = includes.reduce((includes, include) => {
    if (!includes[include.keyHere]) {
      includes[include.keyHere] = include
    }
    return includes
  }, {})

  return function shallowPopulate(context) {
    const { app, type } = context
    let data = type === 'before' ? context.data : (context.result.data || context.result)
    data = [].concat(data || [])

    if (!data.length) {
      return Promise.resolve(context)
    }

    // data1: {
    //   id: '11',
    //   name: 'Dumb Stuff',
    //   trackIds: ['111', '222', '333']
    // }

    // const byKeyHere = {
    //   trackIds: {
    //     '111': [data1, data2],
    //     '222': [data1],
    //     '333': [data1]
    //   }
    // }

    const dataMap = data.reduce((byKeyHere, current) => {
      Object.keys(requiredKeyMappings).forEach(key => {
        byKeyHere[key] = byKeyHere[key] || {}
        const keyHere = getByDot(current, key)

        if (keyHere) {
          if (Array.isArray(keyHere)) {
            if (!requiredKeyMappings[key].asArray) {
              mapData(byKeyHere, key, keyHere[0], current)
            } else {
              keyHere.forEach(hereKey => mapData(byKeyHere, key, hereKey, current))
            }
          } else {
            mapData(byKeyHere, key, keyHere, current)
          }
        }
      })

      return byKeyHere
    }, {})

    // const dataMap = {
    //   keyHere: {
    //     trackIds: {
    //       1: [{}]
    //     }
    //   },
    //   keyThere: {
    //     foo: [...keyHeres].map(here => {
    //       here[nameAs] = tracksResponse[index]
    //     })
    //   }
    // }

    const paramSets = includes.map(i => {
      const keysHere = Object.keys(dataMap[i.keyHere]) || []

      return { query: { [i.keyThere]: { $in: keysHere } } }
    })

    const requests = includes.map((i, index) => app.service(i.service).find(Object.assign({}, paramSets[index], { paginate: false }, i.params)))

    return Promise.all(requests)
      .then(responses => {
        responses.forEach((response, index) => {
          const include = includes[index]
          const relatedItems = response.data || response

          data.forEach(item => {
            const keyHere = getByDot(item, include.keyHere)

            if (keyHere) {
              if (Array.isArray(keyHere)) {
                if (!include.asArray) {
                  setByDot(item, include.nameAs, getRelatedItems(keyHere[0], relatedItems, include))
                } else {
                  setByDot(item, include.nameAs, getRelatedItems(keyHere, relatedItems, include))
                }
              } else {
                setByDot(item, include.nameAs, getRelatedItems(keyHere, relatedItems, include))
              }
            }
          })
        })
        return Promise.resolve(context)
      })
  }
}

function getRelatedItems(ids, relatedItems, include) {
  const { keyThere, asArray } = include
  ids = [].concat(ids || [])
  return relatedItems.reduce((items, currentItem) => {
    ids.forEach(id => {
      id = typeof id === 'number' ? id : id.toString()
      let currentId
      // Allow populating on nested array of objects like key[0].name, key[1].name
      // If keyThere includes a dot, we're looking for a nested prop. This checks if that nested prop is an array.
      // If it's an array, we assume it to be an array of objects.
      // It splits the key only on the first dot which allows populating on nested keys inside the array of objects.
      if (keyThere.includes('.') && Array.isArray(currentItem[keyThere.slice(0, keyThere.indexOf('.'))])) {
        // The name of the array is everything leading up to the first dot.
        const arrayName = keyThere.split('.')[0]
        // The rest will be handed to getByDot as the path to the prop
        const nestedProp = keyThere.slice(keyThere.indexOf('.') + 1)
        // Map over the array to grab each nestedProp's value.
        currentId = currentItem[arrayName].map(nestedItem => {
          const keyThereVal = getByDot(nestedItem, nestedProp)
          return typeof keyThereVal === 'number' ? keyThereVal : keyThereVal.toString()
        })
      } else {
        const keyThereVal = getByDot(currentItem, keyThere)
        currentId = typeof keyThereVal === 'number' ? keyThereVal : keyThereVal.toString()
      } if (asArray) {
        if (currentId.includes(id)) {
          items.push(currentItem)
        }
      } else {
        if (currentId.includes(id)) {
          items = currentItem
        }
      }
    })
    return items
  }, asArray ? [] : {})
}

function mapData(byKeyHere, key, keyHere, current) {
  byKeyHere[key][keyHere] = byKeyHere[key][keyHere] || []
  byKeyHere[key][keyHere].push(current)
  return byKeyHere
}
