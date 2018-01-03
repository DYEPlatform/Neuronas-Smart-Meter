const TYPES = require('../actions/types')

const initialState = {
  sensors: {},
}

module.exports = (state = initialState, action = {}) => {
  console.log(action);
  switch (action.type) {
    case TYPES.ADD_ATTRIBUTE:
      let newEntities = Object.assign({}, state.sensors)
      newEntities[action.id] = action.value
      return Object.assign({}, state, {
        sensors: newEntities
      })

    default:
        return state;
  }
}
