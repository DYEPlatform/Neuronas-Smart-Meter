const Meter = require('./src/meter')
let env_path = '.env'

if ( process.env.NODE_ENV === 'development' ) {
  env_path = '.env.development'
}

require('dotenv').config({ path: env_path })

const config = {
  id: process.env.ID,
  xbeeProductId: process.env.ID_XBEE,
  name: process.env.NAME,
  authPasswords: process.env.AUTH_PASSWORDS,
  authServices: process.env.AUTH_SERVICES,
  mqttServices: process.env.MQTT_SERVICES,
  coapServices: process.env.COAP_SERVICES,
  interval: 1000,
}

const meter = new Meter( config )

meter.start()
