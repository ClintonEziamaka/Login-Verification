// Eziamaka Clinton 


var mongoose = require('mongoose');

//Create Schema
var userSchema = mongoose.Schema({
    uname: String,
    pass: String,
    office: String,
    phoneno: Number,

});


var Users = mongoose.model('Users', userSchema);
module.exports = Users;