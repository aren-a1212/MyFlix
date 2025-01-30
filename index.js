const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/movies', { useNewUrlParser: true, useUnifiedTopology: true });
const express = require('express');
const app = express();
bodyParser = require('body-parser');
uuid = require('uuid');

app.use(bodyParser.json());

let users =[ 
  {"_id":{"$oid":"678a7cac34a8d1a69a5b08e8"},"firstName":"Alice","lastName":"Johnson","email":"alice.johnson@example.com","birthday":{"$date":"1985-02-19T00:00:00Z"},"address":{"street":"123 Elm Street","city":"Springfield","state":"IL","zipCode":"62701"},"phone":"+1-555-1234","isActive":true,"favoriteMovies":[{"$oid":"678a755934a8d1a69a5b08de"},{"$oid":"678a755934a8d1a69a5b08df"}],"username":"alice.johnson"},
{"_id":{"$oid":"678a7cac34a8d1a69a5b08e9"},"firstName":"Bob","lastName":"Smith","email":"bob.smith@example.com","birthday":{"$date":"1990-11-11T00:00:00Z"},"address":{"street":"456 Oak Avenue","city":"Decatur","state":"IL","zipCode":"62521"},"phone":"+1-555-5678","isActive":true,"favoriteMovies":[{"$oid":"678a755934a8d1a69a5b08df"},{"$oid":"678a755934a8d1a69a5b08e2"}],"username":"bob.smith"},
{"_id":{"$oid":"678a7cac34a8d1a69a5b08ea"},"firstName":"Charlie","lastName":"Brown","email":"charlie.brown@example.com","birthday":{"$date":"1982-07-03T00:00:00Z"},"address":{"street":"789 Pine Street","city":"Champaign","state":"IL","zipCode":"61820"},"phone":"+1-555-9101","isActive":false,"favoriteMovies":[{"$oid":"678a755934a8d1a69a5b08e2"},{"$oid":"678a755934a8d1a69a5b08e4"},{"$oid":"678a755934a8d1a69a5b08de"}],"username":"charlie.brown"}

]

// Data for top 10 movies
let movies = 
[
  {"_id":{"$oid":"678a755934a8d1a69a5b08de"},"releaseYear":2010,"genre":{"name":"Sci-Fi","description":"Science Fiction"},"director":{"birthYear":1970,"bio":"Christopher Nolan is a British-American filmmaker renowned for his complex narratives and groundbreaking use of visual effects. His 2010 film Inception is a sci-fi thriller that explores dreams within dreams, earning worldwide acclaim.","deathYear":"alive","name":"Christopher Nolan"},"cast":[{"name":"Leonardo DiCaprio","role":"Dominick Cobb"},{"name":"Joseph Gordon-Levitt","role":"Arthur"}],"durationMinutes":148,"rating":8.8,"title":"Inception"},
  {"_id":{"$oid":"678a755934a8d1a69a5b08df"},"releaseYear":2008,"genre":{"name":"Action","description":"Action/Crime"},"director":{"birthYear":1970,"bio":"Christopher Nolan is a master of blending high-concept ideas with blockbuster filmmaking. The Dark Knight (2008), the second installment in his Batman trilogy, revolutionized the superhero genre and is considered one of the greatest films of the 21st century.","deathYear":"alive","name":"Christopher Nolan"},"cast":[{"name":"Christian Bale","role":"Bruce Wayne"},{"name":"Heath Ledger","role":"Joker"}],"durationMinutes":152,"rating":9,"title":"The Dark Knight"},
  {"_id":{"$oid":"678a755934a8d1a69a5b08e0"},"releaseYear":1999,"genre":{"name":"Sci-Fi","description":"Science Fiction"},"director":{"birthYear":1965,"bio":"The Wachowski sisters, Lana and Lilly, are visionary filmmakers best known for creating The Matrix (1999), a revolutionary sci-fi action film that combined philosophical themes with cutting-edge special effects, forever changing the landscape of cinema.","deathYear":"alive","name":"Wachowski Sisters"},"cast":[{"name":"Keanu Reeves","role":"Neo"},{"name":"Laurence Fishburne","role":"Morpheus"}],"durationMinutes":136,"rating":8.7,"title":"The Matrix"},
  {"_id":{"$oid":"678a755934a8d1a69a5b08e1"},"releaseYear":1972,"genre":{"name":"Crime","description":"Crime/Drama"},"director":{"birthYear":1939,"bio":"Francis Ford Coppola is an iconic American director and producer. His film The Godfather (1972) is one of the most influential films ever made, bringing the Italian-American mafia to the big screen with a level of depth and sophistication never seen before.","deathYear":"alive","name":"Francis Ford Coppola"},"cast":[{"name":"Marlon Brando","role":"Vito Corleone"},{"name":"Al Pacino","role":"Michael Corleone"}],"durationMinutes":175,"rating":9.2,"title":"The Godfather"},
  {"_id":{"$oid":"678a755934a8d1a69a5b08e2"},"releaseYear":1994,"genre":{"name":"Crime","description":"Crime/Drama"},"director":{"birthYear":1963,"bio":"Quentin Tarantino is known for his distinctive storytelling style, characterized by sharp dialogue, nonlinear plots, and graphic violence. Pulp Fiction (1994) was a game-changer, blending pop culture, wit, and dark humor into a cinematic masterpiece.","deathYear":"alive","name":"Quentin Tarantino"},"cast":[{"name":"John Travolta","role":"Vincent Vega"},{"name":"Uma Thurman","role":"Mia Wallace"}],"durationMinutes":154,"rating":8.9,"title":"Pulp Fiction"},
  {"_id":{"$oid":"678a755934a8d1a69a5b08e3"},"releaseYear":1997,"genre":{"name":"Romance","description":"Romantic Drama"},"director":{"birthYear":1954,"deathYear":"alive","bio":"James Cameron is a Canadian filmmaker famous for his epic storytelling and innovative use of technology. Titanic (1997), one of the highest-grossing films of all time, blends romance with historical drama, earning 11 Academy Awards.","name":"James Cameron"},"cast":[{"name":"Leonardo DiCaprio","role":"Jack Dawson"},{"name":"Kate Winslet","role":"Rose DeWitt Bukater"}],"durationMinutes":195,"rating":7.8,"title":"Titanic"},
  {"_id":{"$oid":"678a755934a8d1a69a5b08e4"},"releaseYear":1994,"genre":{"name":"Animation","description":"Animated Musical"},"director":{"birthYear":1949,"deathYear":"alive","bio":"Roger Allers is an American animator and film director. He co-directed The Lion King (1994), one of Disney's most beloved animated classics, which explores themes of family, destiny, and redemption, all set against the backdrop of the African savanna.","name":"Roger Allers"},"cast":[{"name":"Matthew Broderick","role":"Simba"},{"name":"James Earl Jones","role":"Mufasa"}],"durationMinutes":88,"rating":8.5,"title":"The Lion King"},
  {"_id":{"$oid":"678a755934a8d1a69a5b08e5"},"releaseYear":1977,"genre":{"name":"Sci-Fi","description":"Science Fiction"},"director":{"birthYear":1944,"deathYear":2020,"bio":"George Lucas is the legendary creator of the Star Wars franchise. A New Hope (1977) launched a cultural phenomenon that revolutionized the science fiction genre, becoming a global pop culture icon with its groundbreaking visual effects and mythology.","name":"George Lucas"},"cast":[{"name":"Mark Hamill","role":"Luke Skywalker"},{"name":"Carrie Fisher","role":"Leia Organa"}],"durationMinutes":121,"rating":8.6,"title":"Star Wars: A New Hope"},
  {"_id":{"$oid":"678a755934a8d1a69a5b08e6"},"releaseYear":1993,"genre":{"name":"Drama","description":"Historical Drama"},"director":{"birthYear":1946,"deathYear":"alive","bio":"Steven Spielberg is one of the most influential filmmakers of all time. His 1993 film Schindler’s List is a harrowing portrayal of the Holocaust, based on the true story of a businessman who saved the lives of over a thousand Jewish refugees during World War II.","name":"Steven Spielberg"},"cast":[{"name":"Liam Neeson","role":"Oskar Schindler"},{"name":"Ben Kingsley","role":"Itzhak Stern"}],"durationMinutes":195,"rating":9,"title":"Schindler's List"},
  {"_id":{"$oid":"678a755934a8d1a69a5b08e7"},"releaseYear":1994,"genre":{"name":"Drama","description":"Drama/Comedy"},"director":{"birthYear":1951,"bio":"Robert Zemeckis is a pioneering American director known for his innovative use of visual effects. Forrest Gump (1994) is a heartwarming and epic tale of a man with a low IQ who unexpectedly influences several decades of American history.","deathYear":"alive","name":"Robert Zemeckis"},"cast":[{"name":"Tom Hanks","role":"Forrest Gump"},{"name":"Robin Wright","role":"Jenny Curran"}],"durationMinutes":142,"rating":8.8,"title":"Forrest Gump"}
  

  ];
  
//get user 
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
  
  //Create user
  app.post('/users', async (req, res) => {
    await Users.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.username + 'already exists');
        } else {
          Users
            .create({
              firstName:req.body.firstName,
              lastName:req.body.lastName,
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

 //Update id 
 app.put('/users/:firstName', async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username }, { $set:
    {
      firstName:req.body.firstName,
      lastName:req.body.lastName,
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
    console.error(err);
    res.status(500).send('Error: ' + err);
  })

});
    
 // Allow users to remove a movie to their list of favorites (showing only a text that a movie has been added—more on this later);
app.delete('/users/:id/:movieid', async(req , res) =>{
   Users.findOneAndUpdate({ id: req.params.id }, {
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
 // Allow users to add a movie from their list of favorites (showing only a text that a movie has been removed—more on this later);
 app.post('/users/:id/:movieid', async (req, res) => {
  await Users.findOneAndUpdate({ id: req.params.id }, {
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

// Delete Allow existing users to deregister (showing only a text that a user email has been removed—more on this later).
app.delete('/users/:id/',async (req , res) =>{
  Users.findOneAndRemove({id:req.params.id})
.then((users)=>{
  if (!users){
    res.status(400).send(req.params.id + "No user found");
  }else{
    res.status(200).send(req.params.id + "User deleted");
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
app.get('movies/genre/:genre.name', async (req , res) =>{
   await Movies.findOne({"genre.name": req.params.genrename})
  .then((movie)=>{
    res.status(200).json(movie);
  })
  .catch((err)=>{
    console.err(err);
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

