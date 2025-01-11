
const express = require('express');
const app = express();
bodyParser = require('body-parser');
uuid = require('uuid');

app.use(bodyParser.json());

let users =[ 
  {
    id : 1,
    name: "Kim",
    favourtieMovies: [] 
  },
{
  id : 2,
  name : "Joe",
  favourtieMovies: ["The fountain"]
}
]

// Data for top 10 movies
let movies = 
    [
    {
      title: "Inception",
      description: "A skilled thief, who steals secrets from deep within the subconscious during the dream state, is given a chance to have his criminal record erased if he can successfully perform an inception: planting an idea in someone's mind.",
      Genre: {  
        Name: "Science Fiction, Action, Thriller",  
        description: "A genre blending speculative elements about future technology, space, or reality with intense action scenes and high-stakes situations, often involving futuristic or otherworldly elements."
      },
      director: {
        Name: "Christopher Nolan",  
        biography: "Christopher Nolan is a British-American filmmaker known for his intricate, high-concept storytelling and films such as The Dark Knight trilogy, Interstellar, and Dunkirk. He is acclaimed for his non-linear narrative structures and exploration of complex themes."
      }
    },
    {
      title: "The Godfather",
      description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son, Michael, who is slowly pulled into the violent world of crime that his father controlled.",
      Genre: {   
        Name: "Crime, Drama",  
        description: "Crime films focus on illegal activities and the pursuit of justice, while drama highlights emotional depth and complex characters."
      },
      director: {
        Name: "Francis Ford Coppola",  
        biography: "Francis Ford Coppola is an American filmmaker, screenwriter, and producer, best known for The Godfather trilogy, Apocalypse Now, and The Conversation. He is a key figure in American cinema, particularly in the 1970s, known for his work in both commercial and critically acclaimed films."
      }
    },
    {
      title: "Schindler's List",
      description: "Based on a true story, this film follows Oskar Schindler, a German businessman who saves over a thousand Polish Jews during the Holocaust by employing them in his factory, despite the personal and professional risks involved.",
      Genre: {  
        Name: "Drama, History",  
        description: "Historical dramas are films that depict past events and personal stories against a backdrop of real historical events, often with a focus on emotional or moral issues."
      },
      director: {
        Name: "Steven Spielberg",  
        biography: "Steven Spielberg is an American director, producer, and screenwriter widely regarded as one of the most influential filmmakers in the history of cinema. His works include Jaws, E.T. the Extra-Terrestrial, Jurassic Park, and Saving Private Ryan."
      }
    }
  ];
  

  
  //Create user
 app.post('/users' , (req , res) =>{
  const newUser = req.body;

  if(newUser.name){
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  }else{
    res.status(400).send('User needs a Valid name')
  }
 })

 //Update id 
 app.put('/users/:id' , (req , res) =>{
  const {id } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);

  if(user){
    user.name = updatedUser.name;
    res.status(200).json(user);
  }else{
    res.status(400).send('no such user')
  }
 })  
    
 // Allow users to add a movie to their list of favorites (showing only a text that a movie has been added—more on this later);
app.post('/users/:id/:movieTitle', (req , res) =>{
  const {id , movieTitle} = req.params;

let user = users.find(user => user.id == id);

  if(user){
    user.favourtieMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to the user ${id} array`);;
  }else{
    res.status(400).send('no such user')
  }
 })  

 // Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed—more on this later);
 app.delete('/users/:id/:movieTitle', (req , res) =>{
  const {id , movieTitle} = req.params;

let user = users.find(user => user.id == id);

  if(user){
    user.favourtieMovies = user.favourtieMovies.filter(title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from the user ${id} array`);;
  }else{
    res.status(400).send('no such user')
  }
 })  

// Delete Allow existing users to deregister (showing only a text that a user email has been removed—more on this later).
app.delete('/users/:id/', (req , res) =>{
  const {id } = req.params;

let user = users.find(user => user.id == id);

  if(user){
    user = users.filter(user => user.id != id)
    res.status(200).send(`user ${id} has been deleted`);;
  }else{
    res.status(400).send('no such user')
  }
 })  


  // Return a list of ALL movies to the user;
app.get('/movies', (req, res) => {
  res.status(200).json(movies)
});
// Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user;
app.get('/movie/:title', (req , res) =>{
const {title} = req.params;
const movie = movies.find(movie => movie.title === title);

if (movie){
  res.status(200).json(movie);
}else{
  res.status(400).send('No Such Movie')
}
})

// Return data about a genre (description) by name/title (e.g., “Thriller”);
app.get('/movies/Genre/:GenreName', (req , res) =>{
  const {genreName} = req.params;
  const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;
  
  if (Genre){
    res.status(200).json(genre);
  }else{
    res.status(400).send('No Such Movie')
  }
  })

  //return data about director by name.
  app.get('/movies/director/:directorName', (req , res) =>{
    const {directorName} = req.params;
    const director = movies.find(movie => movie.director.Name === directorName).director;
    
    if (director){
      res.status(200).json(director);
    }else{
      res.status(400).send('No Such director')
    }
    })

app.listen(8080, () => console.log('listening on port 8080'))

