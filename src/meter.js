const Zigbee = require('./zigbee'),
      _ = require('lodash'),
      store = require('./store'),
      moment = require('moment'),
      { addAuthService,
        fetchAuthService } = require('./actions/Auth')

module.exports = class Meter {

  constructor ( config ) {
    const validate = this._validateConstructor( config )
    if( _.isEmpty(validate) ) {
      this.id = config.id
      this.zigbee = new Zigbee( config.xbeeProductId, store )
      this.store = store
      this.interval = config.interval || 10000

      this.setAuthServices(config.authServices, config.authPasswords)

      /*this.setMqttServer( `${config.mqtt.server}:${config.mqtt.port}` )
      this.setMqttClient( config.mqtt.client ) */
    }
    else {
      throw new Error(JSON.stringify(validate))
    }
  }

  _validateConstructor( config ) {
    const { id, xbeeProductId, authServices, authPasswords } = config
    let errors = {}

    if( _.isEmpty(id) ) {
      errors.id = 'Parametro Invalido'
    }

    if( !_.isString( xbeeProductId ) || _.isEmpty( xbeeProductId ) ){
      errors.xbeeProductId = "Parametro Invalido"
    }

    if( _.isEmpty( authServices ) && _.isEmpty( authPasswords ) ) {

    }
    else if( !_.isEmpty( authServices ) && _.isEmpty( authPasswords ) ) {
      errors.auth_services = 'No se ha ingresado ninguna password de servicios'
    }
    else if ( !_.isEmpty( authPasswords ) && _.isEmpty( authServices ) ) {
      errors.auth_services = 'No hay servicios para utilizar las contraseñas'
    }
    else if ( !_.isEmpty( authServices ) && !_.isEmpty( authPasswords ) ) {

      const authServiceArray = authServices.split(' ')
      const authPasswordsArray = authPasswords.split(' ')
      if ( authServiceArray.length != authPasswordsArray.length ) {
       errors.auth_services = "El número de servicios y contraseñas no coincide"
      }
    }

    if( !store ) {
      errors.store = 'Error Store'
    }

    return errors

  }

  start () {
    this.bootstrap()

    /*
    *
    * Fake Meter
    *
    *
    this.zigbee.fake()
    this.eventsZigbee()
    */
  }

  bootstrap () {
    setInterval( async () => {
      //console.log('Interval');
      try {
        await this.zigbee.checkConnectZigbee()
      } catch (e) {
        //console.log('error', e);
      }
    }, this.interval)
    this.eventsZigbee()
    this._fetchAuthServices()
  }

   _fetchAuthServices() {
    const services = this.store.getState().Auth.authServices
    const servicesArray = Object.keys(services)
    servicesArray.forEach( index => {
      const { service, password } = services[index]
      const request = {
        service,
        body: {
          id: this.id,
          password
        },
        index,
      }
      this.store.dispatch( fetchAuthService( request ) )
    })
  }

  async setAuthServices ( authServices, authPasswords ) {
    if( !_.isEmpty( authServices ) && !_.isEmpty( authPasswords ) ) {
      const authServiceArray = authServices.split(' ')
      const authPasswordsArray = authPasswords.split(' ')
      authServiceArray.forEach(( service, index ) => {
        const newService = {
            service,
            password: authPasswordsArray[index]
        }
        this.store.dispatch( addAuthService( index, newService ) )
      })
    }
  }

  eventsZigbee () {
    this.zigbee.on('measurement', ( packet ) => {
      //console.log('packet', data);
      this.buildFrame( packet )
    })
  }

  validateFrame ( packet ) {
    return new Promise((resolve, reject) => {
      let errors = {};
      const split = packet.split(',')
      const payload = {
        id_device: split[0],
        id_attribute: split[1],
        value: split[2],
        timestamp: moment( split[3]+'T'+split[4], "DD/MM/YYYYTHH:mm:ss", true).toDate()
      }

      if( !_.isString(packet) || split.length != 5) {
        errors.packet = 'Paquete Invalido'
        reject(errors)
      }

      if( _.isEmpty(payload.id_attribute) || !_.isInteger(+payload.id_attribute) ) {
        errors.id_attribute = 'Parametro Invalido'
      }

      if( _.isEmpty(payload.id_device) || !_.isInteger(+payload.id_device) ) {
        errors.id_device = 'Parametro Invalido'
      }

      if( !moment(payload.timestamp).isValid() ){
        errors.timestamp = 'Parametro Invalido'
      }

      if( _.isEmpty(payload.value) || !isFinite(+payload.value) ){
        errors.value = 'Parametro Invalido'
      }

      if( _.isEmpty(errors)  ){
        resolve(payload)
      }
      else {
        reject(errors)
      }

    })
  }

  buildFrame( packet ) {
    this.validateFrame( packet )
      .then((payload) => {
        this.mqttPublish(payload)
      })
      .catch((err) => {
        console.error(err);
      })
  }


  log(message) {
    console.log(new Date().toString(), message);
  }

  mqttPublish ( packet ) {
    const service = {
      server: this.getMqttServer(),
      client: this.getMqttClient() }
    const payload = {
      data: packet,
      topic: 'entity/attr/'
    }
    ActionsMqtt.mqttPublish( service, payload )
  }

}
