'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = combineReducers;

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

var _combineReducersValidation = require('./utils/combineReducersValidation');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function combineReducers(reducers) {
  // Validate reducers.
  var validReducers = Object.keys(reducers).reduce(function (accum, key) {
    // A reducer must be a function.
    if (typeof reducers[key] !== 'function') {
      if (process.env.NODE_ENV !== 'production') {
        var errorMessage = (0, _combineReducersValidation.getNotSupportedTypeAsReducerError)(reducers, key);
        throw new Error(errorMessage);
      }
      return accum;
    }

    return accum.set(key, reducers[key]);
  }, (0, _seamlessImmutable2.default)({}));

  var validReducerKeys = Object.keys(validReducers);

  if (process.env.NODE_ENV !== 'production') {
    if (validReducerKeys.length === 0) {
      var errorMessage = (0, _combineReducersValidation.getNoValidReducersError)();
      throw new Error(errorMessage);
    }
  }

  var shapeAssertionError = void 0;
  try {
    (0, _combineReducersValidation.assertReducerShape)(validReducers);
  } catch (e) {
    shapeAssertionError = e;
  }

  return function combination() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (0, _seamlessImmutable2.default)({});
    var action = arguments[1];

    if (shapeAssertionError) {
      throw new Error(shapeAssertionError);
    }

    if (process.env.NODE_ENV !== 'production') {
      var warningMessage = (0, _combineReducersValidation.getPossibleUnexpectedStateShapeWarning)(state, validReducers, action);
      if (warningMessage) {
        // eslint-disable-next-line no-console
        // console.warn(warningMessage)
      }
    }

    return validReducerKeys.reduce(function (nextState, key) {
      var nextDomainState = validReducers[key](state[key], action);

      // Validate the next state; it cannot be undefined.
      if (typeof nextDomainState === 'undefined') {
        var _errorMessage = (0, _combineReducersValidation.getUndefinedStateError)(key, action);
        throw new Error(_errorMessage);
      }

      return nextState.set(key, nextDomainState);
    }, (0, _seamlessImmutable2.default)(state));
  };
}