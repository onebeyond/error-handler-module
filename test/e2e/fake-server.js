const MockExpress = require('mock-express');
const {
  CustomErrorTypes,
  errorFactory,
  handleHttpError,
  tagError,
} = require('../..');

const app = MockExpress(); // notice there's no "new"

const loggerMock = {
  error: () => '',
};

app.get('/test-error-basic', (req, res, next) => {
  // creating tagged error
  const wrongInputError = errorFactory(CustomErrorTypes.NOT_FOUND);
  try {
    throw wrongInputError('Wrong Input message', 'Extra info');
  } catch (error) {
    return next(tagError(error));
  }
});

app.get('/test-unhandled-error', (req, res, next) => {
  try {
    throw new Error('Unhandled error');
  } catch (error) {
    return next(tagError(error));
  }
});

app.use(handleHttpError(loggerMock));

module.exports = app;
