var LocalStrategy = require('passport-local').Strategy;
var User = require('../app/models/user');

module.exports = function(passport){
  passport.serializeUser(function(user, done){
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
      done(err, user);
    });
  });

  // Signup
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done){
    process.nextTick(function(){
      User.findOne({'local.email': email}, function(err, user){
        if (err)
          return done(err);
        if (user){
          return done(null, false, req.flash('signupMessage', 'that email is already taken.'));
        } else {
          //if there's no user with the email, create the user
          var newUser = new User();

          // set the user's local credentials
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);

          // save user
          newUser.save(function(err){
            if (err)
              throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));

  // Login
  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, override with email instead
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done){
    User.findOne({'local.email': email}, function(err, user){
      if (err)
        return done(err);

      if (!user)
        return done(null, false, req.flash('loginMessage', 'No user found'));

      // wrong password
      if (!user.validPassword(password))
        return done(null, false, req.flash('loginMessage', 'Wrong password!'));

      // user passed
      return done(null, user);
    });
  }
  ));
};
