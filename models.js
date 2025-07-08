const mongoose = require('mongoose');
const bcrypt = require('bcrypt');



/**
 * Movie Schema
 * @typedef {Object} MovieSchema
 * @property {string} Title - Title of the movie
 * @property {Object} Director - Director information
 * @property {string} Director.Name - Director's full name
 * @property {string} Director.Bio - Director's biography
 * @property {Date} Director.Birth - Director's birth date
 * @property {Date} [Director.Death] - Director's death date (optional)
 * @property {Object} Genre - Genre information
 * @property {string} Genre.Name - Genre name
 * @property {string} Genre.Description - Genre description
 * @property {string} Description - Movie plot description
 * @property {string} ImageURL - URL for movie poster
 * @property {boolean} Featured - Whether movie is featured
 */


let movieSchema=mongoose.Schema({
    title: { type: String, required: true },
    releaseYear: { type: Number, required: true },
    genre: {
        name: { type: String, required: true },
        description: { type: String, required: true }
    },
    director: {
        name: { type: String, required: true },
        birthYear: { type: Number },
        deathYear: { type: String },
        bio: { type: String }
    },
    cast: [{
        name: { type: String, required: true },
        role: { type: String, required: true }
    }],
    durationMinutes: { type: Number },
    rating: { type: Number },
    featured: { type: Boolean }
});




/**
 * User Schema
 * @typedef {Object} UserSchema
 * @property {string} Username - Unique username
 * @property {string} Password - Hashed password
 * @property {string} Email - User's email address
 * @property {Date} Birthday - User's birth date
 * @property {string} FirstName - User's first name
 * @property {string} LastName - User's last name
 * @property {mongoose.Schema.Types.ObjectId[]} FavoriteMovies - Array of favorite movie IDs
 */

let userSchema = mongoose.Schema({
    firstName:{type:String, required: true},
    lastName:{type:String, required: true},
    username:{type:String, required:true},
    password:{type:String,required:true},
    email:{type:String, required:true},
    Birthday: Date,
    address:{
        street:{type:String},
        city: {type:String},
        state:{type:String},
        zipCode:{type:Number},
    },
    phone:{type:Number},
    isActive:{type:Boolean},
    favoriteMovies:[{type:mongoose.Schema.Types.ObjectId, ref:'Movie'}],
});


/**
 * Hashes a password using bcrypt
 * @static
 * @method hashPassword
 * @memberof User
 * @param {string} password - Plain text password to hash
 * @returns {string} Hashed password
 * @throws {Error} If password is not provided
 */
userSchema.statics.hashPassword = function(password) {
    if (!password) {
        throw new Error('Password is required');
    }
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

/**
 * Validates a password against the user's hashed password
 * @method validatePassword
 * @memberof User
 * @param {string} password - Plain text password to validate
 * @returns {boolean} True if password matches, false otherwise
 */
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password); 
};
let Movie = mongoose.model('Movie',movieSchema);
let User = mongoose.model('User',userSchema);

module.exports.Movie =Movie;
module.exports.User =User;