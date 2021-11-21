const util = require('util');
const { isPlainObject } = require('lodash');
const debug = require('debug')('error-handler-module');

const {
  BAD_REQUEST,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} = require('http-status-codes');

function CustomError(type, message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = type || this.constructor.name;
  this.type = type;
  this.message = message;
  this.extra = extra;
}

function CustomHTTPError(statusCode, message, extra, stack) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.statusCode = statusCode;
  this.message = message;
  this.extra = extra;
  this.stack = stack;
}

util.inherits(CustomError, Error);
util.inherits(CustomHTTPError, CustomError);

const defaultMetrics = {
  trackException: () => null,
};

const formatExtraValue = extra => {
  if (!extra) return '';
  if (!isPlainObject(extra)) return extra;
  return JSON.stringify(extra);
};

const handleHttpError = (logger, metrics = defaultMetrics) => (err, req, res, next) => { // eslint-disable-line no-unused-vars
  debug(err);
  logger.error(`${err.message} ${formatExtraValue(err.extra)}`);
  logger.error(err.stack);
  metrics.trackException({ exception: err });
  res.status(err.statusCode || INTERNAL_SERVER_ERROR)
    .json({ message: err.message, extra: err.extra });
};

const CustomErrorTypes = {
  BAD_REQUEST: 'bad_request',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  SWAGGER_INPUT_VALIDATOR: 'swagger_input_validator',
  SWAGGER_OUTPUT_VALIDATOR: 'swagger_output_validator',
  SWAGGER_VALIDATOR: 'swagger_validator',
  OAS_VALIDATOR: 'OpenAPIUtilsError:response',
  UNAUTHORIZED: 'unauthorized',
  WRONG_INPUT: 'wrong_input',
};

const errorFactory = type => (message, extra) => new CustomError(type, message, extra);

const httpErrorFactory = (statusCode = INTERNAL_SERVER_ERROR) => (message, extra, stack) => (
  new CustomHTTPError(statusCode, message, extra, stack)
);

const tagError = (err, newTypes = {}) => {
  let extendedTypes = {};
  if (newTypes) {
    debug('Extending tag with your new types');
    extendedTypes = Object.keys(newTypes)
      .reduce((acum, key) => (
        {
          ...acum,
          [key]: httpErrorFactory(newTypes[key])(err.message, err.extra, err.stack),
        }
      ), {});
  }
  const errors = {
    [CustomErrorTypes.BAD_REQUEST]: httpErrorFactory(BAD_REQUEST)(err.message, err.extra, err.stack),
    [CustomErrorTypes.FORBIDDEN]: httpErrorFactory(FORBIDDEN)(err.message, err.extra, err.stack),
    [CustomErrorTypes.NOT_FOUND]: httpErrorFactory(NOT_FOUND)(err.message, err.extra, err.stack),
    server_error: httpErrorFactory()(err.message, err.extra, err.stack),
    [CustomErrorTypes.SWAGGER_INPUT_VALIDATOR]:
			httpErrorFactory(BAD_REQUEST)(err.message, err.extra, err.stack),
    [CustomErrorTypes.SWAGGER_OUTPUT_VALIDATOR]:
			httpErrorFactory(BAD_REQUEST)(err.message, err.extra, err.stack),
    [CustomErrorTypes.SWAGGER_VALIDATOR]: httpErrorFactory(BAD_REQUEST)(err.message, err.extra, err.stack),
    [CustomErrorTypes.UNAUTHORIZED]: httpErrorFactory(UNAUTHORIZED)(err.message, err.extra, err.stack),
    [CustomErrorTypes.OAS_VALIDATOR]: httpErrorFactory(INTERNAL_SERVER_ERROR)(err.message, err.extra, err.stack),
    [CustomErrorTypes.WRONG_INPUT]: httpErrorFactory(BAD_REQUEST)(err.message, err.extra, err.stack),
    ...extendedTypes,
  };
  debug(`Error type in tagError function: ${err.type}`);
  return errors[err.type] || errors.server_error;
};

module.exports = {
  CustomErrorTypes,
  errorFactory,
  handleHttpError,
  tagError,
};
