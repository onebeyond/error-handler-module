
# error-handler-module

![npm](https://img.shields.io/npm/v/error-handler-module)
[![CircleCI](https://circleci.com/gh/guidesmiths/error-handler-module.svg?style=svg)](https://circleci.com/gh/guidesmiths/error-handler-module)

This module provides a way to handle error for different systems with a few methods.

## Installation

```
npm install --save error-handler-module
```

## Basic Error types

We have setup some errors that we use often use in our projects and we store them in an object which is this:

```js
const CustomErrorTypes = {
  BAD_REQUEST: 'bad_request',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  SWAGGER_VALIDATOR: 'swagger_validator',
  UNAUTHORIZED: 'unauthorized',
  WRONG_INPUT: 'wrong_input',
};
```

*NOTE* If you need another kind of error keep reading on [tagError method](#tagError).

## Methods

### errorFactory(type: String) => (message: String)

This function creates a custom Error with a type and a message you decide.

**Example**

```js
const { errorFactory, CustomErrorTypes } = require('error-handler-module');

// With Basic Errors
const wrongInputError = errorFactory(CustomErrorTypes.WRONG_INPUT);
wrongInputError('Error message');

/* returns
  CustomError {
    name: 'CustomError',
    type: 'wrong_input',
    message: 'Error message'
  }
*/

// with your custom types

// With Basic Errors
const customTypeError = errorFactory('custom-type');
customTypeError('Error message');

/* returns
  CustomError {
    name: 'CustomError',
    type: 'custom-type',
    message: 'Error message'
  }
*/
```

### handleHttpError(logger: Object, metrics: Object) => (err, req, res, next)

This is a function which will work as a middleware for your express app so that your errors will response with an HTTP response.

You have to pass logger and metrics objects as parameters (*Metrics is **not required***).

**Example**

```js
const express = require('express');
const { handleHttpError } = require('error-handler-module');

const app = express();

app.use(handleHttpError(logger, metrics));
```

### tagError(error: Error, newTypes: Object)

This function is going to tag your errors from `CustomError` to `HTTPErrors`so that handleHttpError middleware will understand them.

It receives error and newTypes (*not required*)

*NewTypes object*

In order to add new error types, this object must match this structure:

```js
const newTypes = {
  <Error_type_string>: <status_code_number>,
  <Error_type_string>: <status_code_number>,
  ...
};
````

**Example**

```js
const { errorFactory } = require('error-handler-module');

// With Custom Errors
const customTypeError = errorFactory('tea-pot-error');
const error = customTypeError('Error message');

// const new Type
const newTypes = {
  'tea-pot-error': 418,
};


tagError(error, newTypes);
/* This returns
  CustomHTTPError {
    name: 'CustomHTTPError',
    statusCode: 418,
    message: 'Error message',
    extra: undefined
  }
*/
// This tagError will be added to the catch of the enpoints like this
return next(tagError(error, newTypes))

// With Basic Errors

// With Custom Errors
const customTypeError = errorFactory(CustomErrorTypes.WRONG_INPUT);
const error = customTypeError('Error message');

tagError(error);
/* This returns
  CustomHTTPError {
    name: 'CustomHTTPError',
    statusCode: 400,
    message: 'Error message',
    extra: undefined
  }
*/
```

### Implementation example

```js
const express = require('express');
const {
  CustomErrorTypes,
  errorFactory,
  handleHttpError,
  tagError,
} = require('error-handler-module');

const app = MockExpress(); // notice there's no "new"

const loggerMock = {
  error: () => '',
};

app.get('/test-error-basic', (req, res, next) => {
  // creating tagged error
  const wrongInputError = errorFactory(CustomErrorTypes.NOT_FOUND);
  try {
    throw wrongInputError('Wrong Input message');
  } catch (error) {
    return next(tagError(error));
  }
});

app.get('/test-error-extended', (req, res, next) => {
  // creating a custom tag error
  // for example custom db-error
  const dbError = errorFactory('db-access-not-alloed');
  /*
   * New types must be objects with error and a valid status code
   */
  const newErrors = {
    'db-access-not-alloed': 401,
  };
  try {
    throw dbError('db Error');
  } catch (error) {
    return next(tagError(error, newErrors));
  }
});

app.use(handleHttpError(loggerMock));

module.exports = app;
```

### Debug

This project uses Debug if you want more info of your error please run `DEBUG=error-handler-module <Your_npm_script>`.
