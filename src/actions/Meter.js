const { ADD_ATTRIBUTE } = require('./types')


const addAttribute = ( payload ) => {
  return {
    type: ADD_ATTRIBUTE,
    payload
  }
}

module.exports = {
  addAttribute,
}
