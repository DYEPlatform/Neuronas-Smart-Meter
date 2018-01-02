const redux = require('redux'),
      Entitys = require('./Entity'),
      Mqtt = require('./Mqtt'),
      Zigbee = require('./zigbee'),
      Auth = require('./Auth')

module.exports = redux.combineReducers({
  Entitys,
  Mqtt,
  Zigbee,
  Auth,
});
