const { errorFactory } = require('../..');

describe('errorFactory method', () => {
	it('Error must return a Custom Error', () => {
		const type = 'testError';
		const message = 'Test error message';
		const testError = errorFactory(type);
		const errorProperties = testError(message);
		expect(errorProperties.name).toEqual('CustomError');
		expect(errorProperties.type).toEqual(type);
		expect(errorProperties.message).toEqual(message);
	});
});
