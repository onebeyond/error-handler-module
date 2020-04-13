const { handleHttpError, errorFactory } = require('../..');

describe('handleHttpError method', () => {
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
  it('Error must return a Custom Error with 500 as we do not setup a CustomErrorType', () => {
    const type = 'TestError';
    const message = 'Test error message';
    const testError = errorFactory(type);
    const error = testError(message);
    handleHttpError(loggerMock, metricsMock)(error, reqMock, resMock);
    expect(loggerMock.error).toHaveBeenCalled();
    expect(metricsMock.trackException).toHaveBeenCalledWith({
      exception: error,
    });
    // Error was not tagged
    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith({
      message,
      extra: undefined,
    });
  });
});
