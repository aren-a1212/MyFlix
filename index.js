const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
//mongoose.connect('mongodb://localhost:27017/movies', { useNewUrlParser: true, useUnifiedTopology: true });
const { check, validationResult } = require('express-validator');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');


app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const cors = require('cors');

/**
 * CORS configuration with allowed origins
 * @type {import('cors').CorsOptions}
 */


app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:1234",
      "http://localhost:4200",  
      'https://aren-a1212.github.io',     
      "https://movies-fix-b2e97731bf8c.herokuapp.com",
     "https://arenmyflix.netlify.app"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');




/**
 * GET: Welcome route
 * @name GET /
 * @returns {string} HTML welcome message
 */
app.get("/", (req, res) => {res.send(`<h1>Welcome to Myflix!!</h1>- <p>Lets get started!</p> <p><a href="/documentation.html">Click here to view the Documentation page</a></p>`);});






/**
 * GET: All users
 * @name GET /users
 * @requires passport authentication
 * @returns {Object[]} users - Array of user objects
 */
app.get('/users',passport.authenticate('jwt', { session: false }),async (req, res) => {
 await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
     console.error(err);
     res.status(500).send('Error: ' + err);
   });
});
/**
 * GET: User by username
 * @name GET /users/:username
 * @param {string} username - URL parameter
 * @requires passport authentication
 * @returns {Object} user - User object
 */
app.get(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
 
    if (
      req.user.username === req.params.username ||
      req.user.username === ""
    ) {
      await Users.findOne({ username: req.params.username })
        .then((user) => {
          if (user) {
            res.json(user);
          } else {
            res
              .status(404)
              .send(
                "User with the username " +
                  req.params.username +
                  " was not found."
              );
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    } else {
      return res.status(400).send("Permission denied");
    }
  }
);


  
/**
 * POST: Create new user
 * @name POST /users
 * @param {string} username - Minimum 5 chars, alphanumeric
 * @param {string} firstName - Alphanumeric
 * @param {string} lastName - Alphanumeric
 * @param {string} password - Minimum 8 chars
 * @param {string} email - Valid email format
 * @returns {Object} user - Created user object
 */
  app.post('/users', [
    check('username', 'Username is required').isLength({ min: 5 }),
    check('firstName', 'firstName contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('lastName', 'lastName contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
    check('email', 'Email does not appear to be valid').isEmail()
  ], async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  
    try {
     
      const existingUser = await Users.findOne({ username: req.body.username });
      if (existingUser) {
        return res.status(400).send(req.body.username + ' already exists');
      }
  
     
      const hashedPassword = Users.hashPassword(req.body.password);
  
    
      const newUser = await Users.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        Birthday: req.body.Birthday
      });
  
      
      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error: ' + error.message);
    }
  });
/**
 * PUT: Update user
 * @name PUT /users/:username
 * @param {string} username - URL parameter
 * @requires passport authentication
 * @returns {Object} user - Updated user object
 */
 app.put('/users/:username', passport.authenticate('jwt', { session: false }),[
  check("username", "username is required").isLength({ min: 5 }),
  check(
    "username",
    "Username contains non alphanumeric characters - not allowed."
  ).isAlphanumeric()], async (req, res) => {
    try {
    
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

  
      const updateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email,
        Birthday: req.body.Birthday
      };

      if (req.body.password && req.body.password.trim() !== '') {
        updateData.password = Users.hashPassword(req.body.password);
      }

    /**
 * PUT: Update user
 * @name PUT /users/:username
 * @param {string} username - URL parameter
 * @requires passport authentication
 * @returns {Object} user - Updated user object
 */
      const updatedUser = await Users.findOneAndUpdate(
        { username: req.params.username },
        { $set: updateData },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).send('User not found');
      }

      // Return user without password hash
      const userWithoutPassword = updatedUser.toObject();
      delete userWithoutPassword.password;
      res.json(userWithoutPassword);

    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err.message);
    }
  }
);
/**
 * DELETE: Remove movie from favorites
 * @name DELETE /users/:username/:movieid
 * @param {string} username - URL parameter
 * @param {string} movieid - URL parameter
 * @requires passport authentication
 * @returns {Object} user - Updated user object
 */
app.delete('/users/:username/:movieid',passport.authenticate('jwt', { session: false }), async(req , res) =>{
   Users.findOneAndUpdate({ username: req.params.username }, {
    $pull: { favoriteMovies: req.params.movieid }
  },
  { new: true }) 
 .then((updatedUser) => {
   res.json(updatedUser);
 })
 .catch((err) => {
   console.error(err);
   res.status(500).send("Error: + err");
 });
});


/**
 * POST: Add movie to favorites
 * @name POST /users/:username/:movieid
 * @param {string} username - URL parameter
 * @param {string} movieid - URL parameter
 * @requires passport authentication
 * @returns {Object} user - Updated user object
 */
 app.post('/users/:username/:movieid',passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username }, {
     $push: { favoriteMovies: req.params.movieid }
   },
   { new: true }) 
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: + err");
  });
});

/**
 * DELETE: Deregister user
 * @name DELETE /users/:username
 * @param {string} username - URL parameter
 * @requires passport authentication
 * @returns {string} confirmation message
 */
app.delete('/users/:username',passport.authenticate("jwt", { session: false }),async (req , res) =>{
  Users.findOneAndDelete({username:req.params.username})
.then((users)=>{
  if (!users){
    res.status(400).send(req.params.username + "No user found");
  }else{
    res.status(200).send(req.params.username + "User deleted");
  }
})  
.catch((err)=>{
  console.error(err);
  res.status(500).send("Error")
});
});

/**
 * GET: All movies
 * @name GET /movies
 * @requires passport authentication
 * @returns {Object[]} movies - Array of movie objects
 */
  app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
        await Movies.find()  // Fetch all movies from the database
        .then((movies) => {
            res.status(201).json(movies);  // Send back the list of movies
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);  // Handle errors
        });
});


/**
 * GET: Movie by title
 * @name GET /movies/:title
 * @param {string} title - URL parameter
 * @requires passport authentication
 * @returns {Object} movie - Movie object
 */
app.get('/movies/:title',passport.authenticate('jwt', { session: false }), async (req , res) =>{
await Movies.findOne({title: req.params.title})
.then((movie)=>{
  res.status(200).json(movie);
})
.catch((err) =>{
  console.error(err);
  res.status(500).send('Error:+ err');
});
});


/**
 * GET: Movies by genre
 * @name GET /movies/genre/:genre
 * @param {string} genre - URL parameter
 * @requires passport authentication
 * @returns {Object[]} movies - Array of movie objects
 */
app.get('/movies/genre/:genre',passport.authenticate('jwt', { session: false }), async (req , res) =>{
   await Movies.find({"genre.name": req.params.genre})
  .then((movie)=>{
    res.status(200).json(movie);
  })
  .catch((err)=>{
    console.error(err);
    res.status(500).send('Error')
  });
});
/**
 * GET: Director by name
 * @name GET /movies/director/:directorname
 * @param {string} directorname - URL parameter
 * @requires passport authentication
 * @returns {Object} director - Director information
 */
  app.get('/movies/director/:directorname',passport.authenticate('jwt', { session: false }),async (req , res) =>{
    await Movies.findOne({"director.name":req.params.directorname})
    .then((movie)=>{
      res.status(200).json(movie);
    }
    )
    .catch((err)=>{
      console.error(err);
      res.status(500).send("Error");
    });
  });


 /**
 * Start the server
 * @type {number}
 */


  const port = process.env.PORT || 8080;
  app.listen(port, '0.0.0.0',() => {
   console.log('Listening on Port ' + port);
  });

