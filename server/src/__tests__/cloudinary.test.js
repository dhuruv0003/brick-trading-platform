// Force config values BEFORE requiring the module under test, since
// config/cloudinary.js reads config/env.js (and therefore process.env) at
// require time.
process.env.CLOUDINARY_CLOUD_NAME = 'demo';
process.env.CLOUDINARY_API_KEY = '1234';
process.env.CLOUDINARY_API_SECRET = 'abcd';

const { buildSignature } = require('../config/cloudinary');

describe('Cloudinary buildSignature', () => {
  /**
   * Official Cloudinary documentation test vector:
   * https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
   *
   * Signing "public_id=sample_image&timestamp=1315060510abcd" (where
   * "abcd" is the api_secret) must produce exactly this signature.
   * This is the single most important test in this file: it verifies our
   * hand-rolled signing logic byte-for-byte matches Cloudinary's own
   * reference implementation, using their own published example — not
   * just an assertion that the function "runs".
   */
  it('matches Cloudinary\'s official single-parameter documentation example', () => {
    const signature = buildSignature({
      public_id: 'sample_image',
      timestamp: 1315060510,
    });

    expect(signature).toBe('b4ad47fb4e25c7bf5f92a20089f9db59bc302313');
  });

  /**
   * Official Cloudinary documentation test vector with multiple
   * parameters (public_id + timestamp + eager). This is the case that
   * actually matters for our upload endpoint, since we sign more than one
   * parameter (folder + timestamp) — verifying the multi-parameter case
   * catches bugs the single-parameter test above could miss (e.g. wrong
   * separator, wrong sort behavior with more than one key).
   */
  it('matches Cloudinary\'s official multi-parameter documentation example', () => {
    const signature = buildSignature({
      timestamp: 1315060510,
      public_id: 'sample_image',
      eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop',
    });

    expect(signature).toBe('bfd09f95f331f558cbd1320e67aa8d488770583e');
  });

  it('produces the same signature regardless of the order params are passed in', () => {
    const a = buildSignature({ folder: 'brickpro/uploads', timestamp: 1700000000 });
    const b = buildSignature({ timestamp: 1700000000, folder: 'brickpro/uploads' });

    expect(a).toBe(b);
  });

  it('produces a different signature when any parameter value changes', () => {
    const base = buildSignature({ folder: 'brickpro/uploads', timestamp: 1700000000 });
    const differentFolder = buildSignature({ folder: 'brickpro/other', timestamp: 1700000000 });
    const differentTimestamp = buildSignature({ folder: 'brickpro/uploads', timestamp: 1700000001 });

    expect(base).not.toBe(differentFolder);
    expect(base).not.toBe(differentTimestamp);
  });

  it('excludes undefined, null, and empty-string parameters from the signed string', () => {
    // These must NOT affect the signature — Cloudinary's own docs specify
    // that params with no meaningful value are omitted from signing, and
    // our upload/delete calls sometimes conditionally include optional
    // params (e.g. mimeType is not itself signed, but this guards any
    // future parameter that might be conditionally blank).
    const withExtras = buildSignature({
      folder: 'brickpro/uploads',
      timestamp: 1700000000,
      tag: undefined,
      context: null,
      notes: '',
    });
    const withoutExtras = buildSignature({ folder: 'brickpro/uploads', timestamp: 1700000000 });

    expect(withExtras).toBe(withoutExtras);
  });

  it('is a 40-character lowercase hex SHA-1 digest', () => {
    const signature = buildSignature({ folder: 'brickpro/uploads', timestamp: 1700000000 });

    expect(signature).toMatch(/^[a-f0-9]{40}$/);
  });
});
