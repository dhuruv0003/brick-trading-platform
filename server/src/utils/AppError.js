class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    // A plain `this.message = message` is NOT sufficient here: V8's native
    // Error implementation defines `message` as a non-enumerable own
    // property directly on the instance (this is engine-level behavior,
    // not something a subclass's own assignment overrides the
    // enumerability of). Object.assign only copies own ENUMERABLE
    // properties, so errorHandler.js's production clone
    // (Object.assign(Object.create(...), err)) was silently dropping the
    // message on every single AppError thrown anywhere in the app.
    // Explicitly redefining the property descriptor with enumerable:true
    // is what actually fixes this.
    Object.defineProperty(this, 'message', {
      value: message,
      enumerable: true,
      writable: true,
      configurable: true,
    });
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
