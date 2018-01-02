const redux = require('redux'),
      createLogger = require('redux-node-logger'),
      thunk = require('redux-thunk').default,
      rootReducer = require('../reducer');

// Middlewares
const loggerMiddleware = createLogger();

let store = {}

if ( process.env.NODE_ENV === 'test') {
  store = redux.createStore(
    rootReducer,
    undefined,
    redux.compose(
      redux.applyMiddleware( thunk ),
    )
  );
}
else {
  store = redux.createStore(
    rootReducer,
    undefined,
    redux.compose(
      redux.applyMiddleware( loggerMiddleware, thunk ),
    ),
  );
}

module.exports = store
