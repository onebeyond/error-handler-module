const app = require('./fake-server');

describe('Testing fake server error-handler-module', () => {
  it('Error invalid input payload', done => {
    const req = app.makeRequest();
    const res = app.makeResponse((err, sideEffects) => {
      try {
        if (sideEffects.json) {
          expect(sideEffects.json.message).toEqual('Wrong Input message');
          expect(sideEffects.status).toEqual(404);
          done();
        }
      } catch (assertionsError) {
        done(assertionsError);
      }
    });
    app.invoke('get', '/test-error-basic', req, res);
  });

  it('Error invalid input with extended tagError', done => {
    const req = app.makeRequest();
    const res = app.makeResponse((err, sideEffects) => {
      try {
        // this is needed because the side effect
        // mock does not refresh and keeps the old state of the message
        if (sideEffects.json && sideEffects.json.message === 'db Error') {
          expect(sideEffects.status).toEqual(401);
          done();
        }
      } catch (assertionsError) {
        done(assertionsError);
      }
    });
    app.invoke('get', '/test-error-extended', req, res);
  });

  it('Error invalid input with unhandled error', done => {
    const req = app.makeRequest();
    const res = app.makeResponse((err, sideEffects) => {
      try {
        // this is needed because the side effect
        // mock does not refresh and keeps the old state of the message
        if (sideEffects.json && sideEffects.json.message === 'Unhandled error') {
          expect(sideEffects.status).toEqual(500);
          done();
        }
      } catch (assertionsError) {
        done(assertionsError);
      }
    });
    app.invoke('get', '/test-unhandled-error', req, res);
  });
});
