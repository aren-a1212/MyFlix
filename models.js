const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

let userSchema = mongoose.Schema({
    firstName:{type:String, required: true},
    lastName:{type:String, required: true},
    username:{type:String, required:true},
    Password:{type:String,required:true},
    Email:{type:String, required:true},
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
// Static method to hash password
userSchema.statics.hashPassword = function(password) {
    if (!password) {
        throw new Error('Password is required');
    }
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

// Method to validate password
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password); 
};
let Movie = mongoose.model('Movie',movieSchema);
let User = mongoose.model('User',userSchema);

module.exports.Movie =Movie;
module.exports.User =User;