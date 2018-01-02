const { SET_AUTH_SERVICES,
        SET_AUTH_TOKEN } = require('../actions/types')

const initialState = {
  authServices: {},
}

module.exports = (state = initialState, action = {}) => {
  let newServices;
  console.log(action.type);
  switch (action.type) {
    case SET_AUTH_SERVICES:
      newServices = Object.assign({}, state.authServices)
      newServices[action.index] = action.service
      return Object.assign({}, state, {
        authServices: newServices
      })

    case SET_AUTH_TOKEN:
      newServices = Object.assign({}, state.authServices)
      newServices[action.index].token = action.token
      return Object.assign({}, state, {
        authServices: newServices
      })

    default:
        return state;
  }
}
