const redux = require('redux'),
      Meter = require('./Meter'),
      Zigbee = require('./zigbee'),
      Auth = require('./Auth')

module.exports = redux.combineReducers({
  Meter,
  Zigbee,
  Auth,
});
