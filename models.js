const mongoose = require('mongoose');

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
    FavoriteMovies:[{type:mongoose.Schema.Types.ObjectId, ref:'Movie'}],
    username:{type:String}
});
let Movie = mongoose.model('Movie',movieSchema);
let User = mongoose.model('User',userSchema);

module.exports.Movie =Movie;
module.exports.User =User;