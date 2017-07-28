const passport = require('passport');
const mongoose  = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    next();
    return
  }
  req.flash('error', 'Oops, you need to login');
  res.redirect('/login');
};

exports.forgot = async(req, res, next) => {

  const user = await User.findOne({ email: req.body.email});
  if(!user) {
    req.flash('error', 'No email found'); //dont do this in real life!
    return res.redirect('/login');
  }

  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`
  req.flash('success', `You have been sent a password reset link ${resetURL}`);

  res.redirect('/login');
}
