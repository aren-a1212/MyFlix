# MYFLIX
*MYFLIX* is a RESTful API built with Node.js, Express, MongoDB, and Passport for handling user authentication and managing movies, users, and their favorites. The API allows for user registration, login, and CRUD operations on movies and user profiles.

## Key Features

**Goals**

- Provide Movie Data: The API returns all the necessary movie details, such as titles, descriptions, genres, and more.
- User Profiles: Users can register, update their details, and save movies they like to their favorite list.
- RESTful Design: I’ve followed best practices for building RESTful APIs, ensuring smooth communication between the client and server.


1. Movies

- Fetch a list of all movies.
- Get detailed information about a specific movie by its title (description, genre, director, image URL, and more).

2. Genres

- Retrieve information about a genre (description) by its name.

3. Directors

- Get director details (bio, birth year, and death year) by name.

4. User Management

- Register a new user.
- Update user details (e.g., username, email, password, and date of birth).
- Add and remove movies from the user's list of favorites.
- Deregister a user account when they no longer wish to use the app.


## API Endpoints

Here’s a list of the available API endpoints and their descriptions:

| Endpoint                      | Method | Description                            |
| ----------------------------- | ------ | -------------------------------------- |
| `/movies`                     | GET    | Get all movies                         |
| `/movies/:title`              | GET    | Get a specific movie by title          |
| `/genres/:name`               | GET    | Get details about a genre              |
| `/directors/:name`            | GET    | Get details about a director           |
| `/users`                      | POST   | Register a new user                    |
| `/users/:username`            | PUT    | Update user details                    |
| `/users/:username/movies/:id` | POST   | Add a movie to a user's favorites      |
| `/users/:username/movies/:id` | DELETE | Remove a movie from a user's favorites |
| `/users/:username`            | DELETE | Deregister a user account              |

## How to Run Locally

If you want to run the myFlix Movie API locally, follow these steps:

**Clone the Repository**

```bash
git clone https://github.com/yourusername/myflix-api.git
cd myflix-api
```

**Install Dependencies**

```bash
npm install
```

**Set Up MongoDB**

- Connect to your MongoDB instance (local or cloud-based).
- Create a .env file and add your MongoDB connection string.

**Run the Server**

```bash
npm start
```

**Test the API**
Open Postman or your API testing tool to verify the endpoints are working correctly.

## Technologies Used

- Backend: Node.js, Express
- Database: MongoDB with Mongoose ORM
- Authentication: JWT (JSON Web Tokens)
- Testing: Postman
- Deployment: Heroku
- Middleware: body-parser, morgan, and other Express middleware
## Contributing

Feel free to fork this repository, create a branch, and submit a pull request. Please ensure you follow the code formatting guidelines and include tests for any new features.

