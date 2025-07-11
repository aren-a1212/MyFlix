/**
 * Authentication module for handling JWT-based user authentication
 * @module auth
 */


const jwtSecret = 'SECRET_KEY';

const jwt = require('jsonwebtoken'),
passport = require('passport');

require('./passport');

let generateJWTToken =(user)=>{
    return jwt.sign(user, jwtSecret,{
        subject: user.username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}
/**
 * Authentication setup function
 * @function
 * @param {express.Router} router - Express router instance
 * @returns {void}
 */
module.exports = (router) => {
    router.post('/login', (req, res) => {
      passport.authenticate('local', { session: false }, (error, user, info) => {
        if (error || !user) {
          return res.status(400).json({
            message: 'Something is not right',
            user: user
          });
        }
        req.login(user, { session: false }, (error) => {
          if (error) {
            res.send(error);
          }
          let token = generateJWTToken(user.toJSON());
          return res.json({ user, token });
        });
      })(req, res);
    });
  }