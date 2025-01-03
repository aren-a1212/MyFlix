const express = require('express');
const app = express();
const morgan = require ('morgan');
const port = 3000;

app.use(morgan('common'));
app.use(express.static('public'));
// Data for top 10 movies
const topMovies = [
    { title: 'The Godfather', year: 1972, genre: 'Crime, Drama' },
    { title: 'Titanic', year: 1997, genre: 'Romance, Drama' },
    { title: 'Star Wars: Episode IV - A New Hope', year: 1977, genre: 'Sci-Fi, Adventure' },
    { title: 'Forrest Gump', year: 1994, genre: 'Drama, Romance' },
    { title: 'The Shawshank Redemption', year: 1994, genre: 'Drama' },
    { title: 'The Dark Knight', year: 2008, genre: 'Action, Crime, Drama' },
    { title: 'Jurassic Park', year: 1993, genre: 'Sci-Fi, Adventure' },
    { title: 'Pulp Fiction', year: 1994, genre: 'Crime, Drama' },
    { title: 'The Matrix', year: 1999, genre: 'Sci-Fi, Action' },
    { title: 'The Lion King', year: 1994, genre: 'Animation, Adventure, Drama' }
  ];
  

app.get('/', (req, res) => {
  res.send('Welcome to the Movie API! Visit /movies to see my top 10 movies.');
});

// Define the `/movies` route with JSON data
app.get('/movies', (req, res) => {
  res.json(topMovies); 
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
