const {
  handleHttpError, errorFactory, tagError, CustomErrorTypes,
} = require('../..');

describe('tagError method', () => {
  const resMock = {
    status: jest.fn(() => resMock),
    json: jest.fn(),
  };

  const loggerMock = {
    error: jest.fn(),
  };

  const metricsMock = {
    trackException: jest.fn(),
  };

  const reqMock = {};
  it.only('Error must return a Custom Error with 403 as we are tagging this error', () => {
    const type = CustomErrorTypes.FORBIDDEN;
    const message = 'Test error message';
    const testError = errorFactory(type);
    const error = testError(message);
    const taggedError = tagError(error);
    handleHttpError(loggerMock, metricsMock)(taggedError, reqMock, resMock);
    expect(loggerMock.error).toHaveBeenCalledTimes(2);
    expect(loggerMock.error).toHaveBeenLastCalledWith(expect.stringMatching(/tagError.test.js:24:19/));
    expect(metricsMock.trackException).toHaveBeenCalledWith({
      exception: error,
    });
    // Error was tagged as forbidden
    expect(resMock.status).toHaveBeenCalledWith(403);
    expect(resMock.json).toHaveBeenCalledWith({
      message,
      extra: undefined,
    });
  });
});
