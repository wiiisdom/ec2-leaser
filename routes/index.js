var router = require('express').Router();

// API subfolder
router.use('/api', require('./api'));

// router.get('/auth/google', passport.authenticate('google', {
//    scope: ['profile']
//  }));
//
// router.get('/auth/google/callback',
//     passport.authenticate('google', {
//         failureRedirect: '/'
//     }),
//     (req, res) => {
//       res.redirect('/');
//     }
// );

module.exports =  router
