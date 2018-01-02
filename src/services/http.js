const axios = require('axios')

const get = ( URI ) => {
  return axios.get(URI)
}

const post = ( URI, body ) => {
  return axios.post( URI, body )
}

module.exports = {
  get,
  post
}
