const expect = require("chai").expect,
      Meter = require('../src/meter'),
      assert = require('chai').assert,
      forEach = require('mocha-each')


require('dotenv').config({ path: '.env.development' })

describe("Bootstrap Meter", () => {

  forEach([
    ['8cee97fc','6001','1:123456','1:localhost:3000'],
    ['8cee97fc','6001',undefined,undefined],
    ['8cee97fc','6001','',''],
  ])
  .it('pass validateConstructor', (  id, xbeeProductId, authPasswords, authServices, done ) => {
    try {
      const config = {
        id,
        xbeeProductId,
        authPasswords,
        authServices,
      }
      const meter = new Meter( config )
      done();
    } catch (e) {
      done('failed');
    }
  })

  forEach([
    ['','6001','123456','localhost:3000'],
    ['8cee97fc','','123456','localhost:3000'],
    ['8cee97fc','6001','','localhost:3000'],
    ['8cee97fc','6001','123456',''],
    ['8cee97fc','6001','123456 123456','localhost:3000'],
  ])
  .it('fail validateConstructor', (  id, xbeeProductId, authPasswords, authServices, done ) => {
    try {
      const config = {
        id,
        xbeeProductId,
        authPasswords,
        authServices,
      }
      const meter = new Meter( config )
      done('failed');
    } catch (e) {
      done();
    }
  })

})


describe("attributeValidation", () => {

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

  let meter = {};
  const testPromiseAll = ( test ) => {
    return new Promise(function(resolve, reject) {
      let count = 0
      let func = []
      test.forEach( data => {
        func.push(meter.validateFrame(data))
      })
      Promise.all(func.map(p => p.catch(() => undefined)))
        .then((value) => {
          const filter = value.filter(Boolean)
          resolve(filter.length)
        })
    });
  }

  before( ( done ) => {
    meter = new Meter( config )

    done()
  })

  it('pass attributeValidation', ( done ) => {
    const test = [
      '03,3331, 0.000,01/11/2020,19:04:05',
      '02,3316,1.2,02/06/2010,18:04:27',
      '92,33281,227.12332,02/12/2017,20:18:03',
      '01,3317,1.323,11/12/2017,20:22:00',
    ]

    testPromiseAll(test)
      .then((count) => {
        assert.equal(test.length, count, '== prueba');
        done()
      })
      .catch((err) => {
        done(err)
      })

  })

  it('fail attributeValidation', ( done ) => {
    const test = [
      'aas,3331, 0.000,01/11/2020,19:04:05',
      '06,30.32,,02/06/2010,18:04:27',
      '123,33281,227./12332,02/12/2017,20:18:03',
      '12,3317,1.323,,20:22',
      '21,3323,23.3.2,32-11-20-2,23:12',
      '23,3318,1.23,02-11-20-1,08',
      '22,3317,32.3,20/18/2017,22:32:01',
      '22,3317,32.3,20/12/2017,22:80:01',
      '3sdsa,dasdas,,dasd,dsa',
      '33,3321,32.2,-4/2/2017,33:22:11'
    ]

    testPromiseAll(test)
      .then((count) => {
        assert.equal(0, count, '== prueba');
        done()
      })
      .catch((err) => {
        done(err)
      })

  })

});
