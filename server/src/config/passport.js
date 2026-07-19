const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('./env');
const customerAuthService = require('../services/CustomerAuthService');

if (config.google?.clientId && config.google?.clientSecret) {
  passport.use(
    'google-customer',
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl || '/api/v1/customer/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract primary email and photo
          const email = profile.emails && profile.emails[0]?.value;
          const photo = profile.photos && profile.photos[0]?.value;

          if (!email) {
            return done(new Error('Google account must have an email address.'), false);
          }

          const customer = await customerAuthService.findOrCreateFromGoogle({
            googleId: profile.id,
            email,
            firstName: profile.name?.givenName || profile.displayName || 'Google',
            lastName: profile.name?.familyName || 'User',
            avatar: photo,
          });

          return done(null, customer);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
}

module.exports = passport;
