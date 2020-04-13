const { CustomErrorTypes } = require('../..');

describe('CustomErrorTypes object', () => {
  it('Custom error types must match last snapshot', () => {
    expect(CustomErrorTypes).toMatchSnapshot();
  });
});
