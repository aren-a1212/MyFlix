require('dotenv').config();
const fileUpload = require('express-fileupload');
const { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');


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

app.use(fileUpload());

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const IMAGES_BUCKET = process.env.IMAGES_BUCKET || 'bucketfor2.5forlambda';
const PREFIX_ORIG = (process.env.IMAGES_PREFIX_ORIG || 'original-images/');
const PREFIX_THUMBS = (process.env.IMAGES_PREFIX_THUMBS || 'resized-images/');
const s3Client = new S3Client({ region: AWS_REGION });


app.get('/healthz', (_, res) => res.status(200).send('ok'));
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
      "https://arenmyflix.netlify.app",
      "http://54.147.37.43",
      "http://myflix-media-bucket.s3-website-us-east-1.amazonaws.com",
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
app.get("/", (req, res) => {
  res.send(`
    <h1>Welcome to Myflix!!</h1>
    <p>Lets get started!</p>
    <p><a href="/documentation.html">Click here to view the Documentation page</a></p>
    <p><a href="/gallery.html">View Image Gallery</a></p>
  `);
});

app.get("/gallery.html", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Image Gallery</title>
      <style>
        .gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          padding: 20px;
        }
        .gallery-item {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 5px;
          text-align: center;
        }
        .gallery-item img {
          max-width: 100%;
          height: auto;
        }
        .upload-section {
          padding: 20px;
          background: #f5f5f5;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="upload-section">
        <h2>Upload New Image</h2>
        <form id="uploadForm" enctype="multipart/form-data">
          <input type="file" name="file" required>
          <button type="submit">Upload</button>
        </form>
        <div id="uploadStatus"></div>
      </div>
      
      <h2>Image Gallery</h2>
      <div class="gallery" id="imageGallery"></div>
      
      <script>
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData();
          formData.append('file', e.target.file.files[0]);
          
          try {
            const response = await fetch('/api/s3/upload', {
              method: 'POST',
              body: formData
            });
            
            if (response.ok) {
              document.getElementById('uploadStatus').textContent = 'Upload successful!';
              loadGallery();
            } else {
              document.getElementById('uploadStatus').textContent = 'Upload failed';
            }
          } catch (error) {
            document.getElementById('uploadStatus').textContent = 'Upload error: ' + error.message;
          }
        });
        
        async function loadGallery() {
          try {
            const response = await fetch('/api/s3/gallery');
            const images = await response.json();
            
            const gallery = document.getElementById('imageGallery');
            gallery.innerHTML = '';
            
            images.forEach(image => {
              const item = document.createElement('div');
              item.className = 'gallery-item';
              item.innerHTML = \`
                <img src="\${image.url}" alt="\${image.name}">
                <p>\${image.name}</p>
                <button onclick="downloadImage('\${image.name}')">Download</button>
                <button onclick="deleteImage('\${image.name}')">Delete</button>
              \`;
              gallery.appendChild(item);
            });
          } catch (error) {
            console.error('Error loading gallery:', error);
          }
        }
        
        function downloadImage(key) {
          window.open(\`/api/s3/download/\${key}\`, '_blank');
        }
        
        async function deleteImage(key) {
          if (confirm('Are you sure you want to delete this image?')) {
            try {
              const response = await fetch(\`/api/s3/delete/\${key}\`, {
                method: 'DELETE'
              });
              
              if (response.ok) {
                loadGallery();
              } else {
                alert('Delete failed');
              }
            } catch (error) {
              console.error('Delete error:', error);
            }
          }
        }
        
        // Load gallery on page load
        loadGallery();
      </script>
    </body>
    </html>
  `);
});


/**
 * GET: All users
 * @name GET /users
 * @requires passport authentication
 * @returns {Object[]} users - Array of user objects
 */
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
app.put('/users/:username', passport.authenticate('jwt', { session: false }), [
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
app.delete('/users/:username/:movieid', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
app.post('/users/:username/:movieid', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
app.delete('/users/:username', passport.authenticate("jwt", { session: false }), async (req, res) => {
  Users.findOneAndDelete({ username: req.params.username })
    .then((users) => {
      if (!users) {
        res.status(400).send(req.params.username + "No user found");
      } else {
        res.status(200).send(req.params.username + "User deleted");
      }
    })
    .catch((err) => {
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
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ title: req.params.title })
    .then((movie) => {
      res.status(200).json(movie);
    })
    .catch((err) => {
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
app.get('/movies/genre/:genre', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find({ "genre.name": req.params.genre })
    .then((movie) => {
      res.status(200).json(movie);
    })
    .catch((err) => {
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
app.get('/movies/director/:directorname', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ "director.name": req.params.directorname })
    .then((movie) => {
      res.status(200).json(movie);
    }
    )
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error");
    });
});



// S3 Routes
/**
 * GET: List all objects in S3 bucket
 * @name GET /api/s3/objects
 * @requires passport authentication
 * @returns {Object[]} objects - Array of S3 objects
 */
app.get('/api/s3/objects', async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME
    });
    const data = await s3Client.send(command);
    res.json(data.Contents || []);
  } catch (error) {
    console.error('S3 List Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST: Upload file to S3 bucket
 * @name POST /api/s3/upload
 * @requires passport authentication
 * @returns {Object} result - Upload result with filename
 */
app.post('/api/s3/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    const fileName = `${Date.now()}-${file.name}`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.data,
      ContentType: file.mimetype
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    res.json({ message: 'File uploaded successfully', fileName });
  } catch (error) {
    console.error('S3 Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
});




/**
 * GET: Download file from S3 bucket
 * @name GET /api/s3/download/:key
 * @param {string} key - URL parameter (filename)
 * @returns {file} file - The requested file
 */
app.get('/api/s3/objects', async (req, res) => {
  try {
    const r = await s3Client.send(new ListObjectsV2Command({ Bucket: IMAGES_BUCKET }));
    res.json(r.Contents || []);
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
});

// Gallery endpoint - returns resized images
app.get('/api/s3/gallery', async (req, res) => {
  try {
    const r = await s3Client.send(new ListObjectsV2Command({
      Bucket: IMAGES_BUCKET
    }));

    // Filter out any folder objects and format the response
    const images = (r.Contents || [])
      .filter(item => item.Size > 0) // Exclude folders
      .map(item => ({
        name: item.Key,
        url: `https://${IMAGES_BUCKET}.s3.amazonaws.com/${item.Key}`,
        size: item.Size,
        lastModified: item.LastModified
      }));

    res.json(images);
  } catch (e) {
    console.error('S3 Gallery Error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/s3/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.file) return res.status(400).json({ error: 'No file uploaded' });
    const f = req.files.file;
    const key = `${Date.now()}-${f.name}`; // Remove the PREFIX_ORIG since you're using a different bucket
    await s3Client.send(new PutObjectCommand({
      Bucket: 'myflix-media-bucket', // Use your actual bucket name
      Key: key,
      Body: f.data,
      ContentType: f.mimetype
    }));
    res.json({ message: 'File uploaded', key });
  } catch (e) {
    console.error('S3 Upload Error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/s3/download/:key(*)', async (req, res) => {     // note :key(*) to allow slashes
  try {
    const key = req.params.key;
    const obj = await s3Client.send(new GetObjectCommand({ Bucket: IMAGES_BUCKET, Key: key }));
    if (obj.ContentType) res.setHeader('Content-Type', obj.ContentType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(key.split('/').pop())}"`);
    obj.Body.pipe(res);
  } catch (e) { console.error('S3 Download Error:', e); res.status(500).json({ error: e.message }); }
});

app.delete('/api/s3/delete/:key(*)', async (req, res) => {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: IMAGES_BUCKET, Key: req.params.key }));
    res.json({ message: 'Deleted', key: req.params.key });
  } catch (e) { console.error('S3 Delete Error:', e); res.status(500).json({ error: e.message }); }
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});