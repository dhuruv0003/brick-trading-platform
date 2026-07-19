const AppError = require('../utils/AppError');

describe('AppError', () => {
  it('sets message as an own property (not just inherited from Error.prototype)', () => {
    const err = new AppError('Cannot transition order from "pending" to "processing".', 400);
    expect(Object.prototype.hasOwnProperty.call(err, 'message')).toBe(true);
  });

  it('message survives the exact clone pattern used by errorHandler.js in production', () => {
    const err = new AppError('Cannot transition order from "pending" to "processing".', 400);

    // This mirrors errorHandler.js's sendErrorProd path exactly:
    //   let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
    // Before the fix, this produced an object with message === '' because
    // Error.prototype.message is non-enumerable and therefore invisible to
    // Object.assign's own-enumerable-property copy.
    const cloned = Object.assign(Object.create(Object.getPrototypeOf(err)), err);

    expect(cloned.message).toBe('Cannot transition order from "pending" to "processing".');
    expect(cloned.message).not.toBe('');
  });

  it('still sets statusCode and status correctly', () => {
    const err = new AppError('Not found.', 404);
    expect(err.statusCode).toBe(404);
    expect(err.status).toBe('fail');
  });

  it('marks 5xx errors with status "error" instead of "fail"', () => {
    const err = new AppError('Something broke.', 500);
    expect(err.status).toBe('error');
  });
});
