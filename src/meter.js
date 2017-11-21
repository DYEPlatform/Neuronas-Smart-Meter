const Zigbee = require('./zigbee')
const _ = require('lodash')
const store = require('./store')
const ActionsMqtt = require('./actions/Mqtt')

module.exports = class Meter {

  constructor ( id, xbeeProductId, mqttServer ) {
    const validate = this._validateConstructor( id, xbeeProductId, mqttServer )
    if( _.isEmpty(validate) ) {
      this.id = id
      this.zigbee = new Zigbee( xbeeProductId, store )
      this.store = store

      this.setMqttServer( mqttServer )
    }
    else {
      throw new Error(JSON.stringify(validate))
    }
  }

  _validateConstructor( id, xbeeProductId, mqttServer ) {

    let errors = {}

    if( !_.isString( xbeeProductId ) ){
      errors.xbeeProductId = "Parametro Invalido"
    }

    if( !_.isString( mqttServer ) ){
      errors.mqttServer = "Parametro Invalido"
    }

    if( _.isEmpty(id) ) {
      errors.id = 'Parametro Invalido'
    }

    if( !store ) {
      errors.store = 'Error Store'
    }

    return errors

  }

  start (){
    this.bootstrap()
  }

  bootstrap () {
    setInterval( async () => {
      console.log('Interval');
      try {
        await this.zigbee.checkConnectZigbee()
      } catch (e) {
        console.log('error', e);
      }
    }, 10000)
    this.eventsZigbee()
  }

  getState() {
    console.log(this.store.getState());
    return this.store.getState()
  }

  eventsZigbee () {
    this.zigbee.on('measurement', (data) => {
      //console.log('packet', data);
      this.buildFrame(data)
    })
  }

  buildFrame( packet ) {
    if( _.isString(packet) ) {
      const split = packet.split(',')
      const payload = {
        id_device: split[0],
        id_attribute: split[1],
        value: split[2],
        timestamp:split[3]+'T'+split[4],
      }
      this.mqttPublish(payload)
    }
    else {
      this.log('Error Packet')
    }
  }

  setMqttServer ( server ) {
    this.store.dispatch( ActionsMqtt.setMqttServer( server ) )
  }

  log(message) {
    console.log(new Date().toString(), message);
  }

  mqttPublish ( packet ) {
    const service = this.store.getState().Mqtt.server
    const payload = {
      data: packet,
      topic: 'entity/attr/'
    }
    ActionsMqtt.mqttPublish( service, payload )
  }

}
