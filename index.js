const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/movies', { useNewUrlParser: true, useUnifiedTopology: true });


const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//get all users 
app.get('/users', async (req, res) => {
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
  app.post('/users/:username', async (req, res) => {
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
 app.put('/users/:userame', async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username }, { $set:
    {
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      username:req.body.username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }) 
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })

});
    
 // Allow users to remove a movie to their list of favorites 
app.delete('/users/:username/:movieid', async(req , res) =>{
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
 app.post('/users/:username/:movieid', async (req, res) => {
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
app.delete('/users/:username',async (req , res) =>{
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
  app.get('/movies', async (req, res) => {
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
app.get('/movie/:title', async (req , res) =>{
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
app.get('/movies/genre/:genre', async (req , res) =>{
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
  app.get('/movies/director/:directorname',async (req , res) =>{
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

app.listen(8080, () => console.log('listening on port 8080'))

