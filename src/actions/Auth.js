const { SET_AUTH_SERVICES, SET_AUTH_TOKEN } = require('./types')
const http = require('../services/http')

const addAuthService = ( index, service ) => {
  return {
    type: SET_AUTH_SERVICES,
    index,
    service,
  }
}

const setAuthToken = ( index, token ) => {
  return {
    type: SET_AUTH_TOKEN,
    index,
    token
  }
}

const fetchAuthService = request => {
  return dispatch => {
    const { service, body, index } = request
    http.post(service , body)
          .then(( response ) => {
            dispatch(setAuthToken( index, response.data.token))
            return
          })
          .catch((err) => {
              return
          })
  }
}

module.exports = {
  addAuthService,
  fetchAuthService
}
