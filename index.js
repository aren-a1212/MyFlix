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
app.use(cors());
let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');
//get all users 
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
  
  //Creates new users
  app.post('/users',[
    check('username', 'Username is required').isLength({min: 5}),
    check('firstName', 'firstName contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('lastName', 'lastName contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.password);
    await Users.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.username + 'already exists');
        } else {
          Users
            .create({
              firstName:req.body.firstName,
              lastName:req.body.lastName,
              username:req.body.username,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

 //Updates info 
 app.put('/users/:username', passport.authenticate('jwt', { session: false }),[
  check("username", "username is required").isLength({ min: 5 }),
  check(
    "username",
    "Username contains non alphanumeric characters - not allowed."
  ).isAlphanumeric(),
  check("password", "Password is required").not().isEmpty()], async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  // CONDITION TO CHECK ADDED HERE
  if(req.user.username !== req.params.username){
      return res.status(400).send('Permission denied');
  }
  // CONDITION ENDS
  await Users.findOneAndUpdate({ username: req.params.username }, {
      $set:
      {
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        username:req.body.username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
  },
      { new: true }) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
          res.json(updatedUser);
      })
      .catch((err) => {
          console.log(err);
          res.status(500).send('Error: ' + err);
      })
});
    
 // Allow users to remove a movie to their list of favorites 
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
 // Allow users to add a movie from their list of favorites 
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

// Delete Allow existing users to deregister 
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

  // Return a list of ALL movies to the user;
  app.get('/movies', passport.authenticate('jwt', {session:false}), async (req, res) => {
        await Movies.find()  // Fetch all movies from the database
        .then((movies) => {
            res.status(201).json(movies);  // Send back the list of movies
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);  // Handle errors
        });
});


// Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user;
app.get('/movie/:title',passport.authenticate('jwt', { session: false }), async (req , res) =>{
Movies.findOne({title: req.params.title})
.then((movie)=>{
  res.status(200).json(movie);
})
.catch((err) =>{
  console.error(err);
  res.status(500).send('Error:+ err');
});
});



// Return data about a genre (description) by name/title (e.g., “Thriller”);
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

  //return data about director by name.
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

  const port = process.env.PORT || 8080;
  app.listen(port, '0.0.0.0',() => {
   console.log('Listening on Port ' + port);
  });

