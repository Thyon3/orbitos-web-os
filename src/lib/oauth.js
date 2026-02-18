const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }

    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      user.googleId = profile.id;
      user.avatar = user.avatar || profile.photos[0].value;
      await user.save();
      return done(null, user);
    }

    user = new User({
      googleId: profile.id,
      username: profile.emails[0].value.split('@')[0],
      email: profile.emails[0].value,
      displayName: profile.displayName,
      avatar: profile.photos[0].value,
      isVerified: true
    });
    
    await user.save();
    done(null, user);
  } catch (error) {
    done(error);
  }
}
));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/api/auth/github/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });
    
    if (user) {
      return done(null, user);
    }

    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      user.githubId = profile.id;
      user.avatar = user.avatar || profile.photos[0].value;
      await user.save();
      return done(null, user);
    }

    user = new User({
      githubId: profile.id,
      username: profile.username,
      email: profile.emails[0].value,
      displayName: profile.displayName || profile.username,
      avatar: profile.photos[0].value,
      isVerified: true
    });
    
    await user.save();
    done(null, user);
  } catch (error) {
    done(error);
  }
}
));

module.exports = passport;
