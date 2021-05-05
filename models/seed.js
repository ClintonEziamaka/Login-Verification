// Eziamaka Clinton 


var md5 = require('md5')
//Example for seeding the database
var seed = function(Users) {
    Users.find(function(err, users) {
        if (users.length) return;

        new Users({
            uname: "admin",
            pass: md5("admin"),
            officeNum: "U5b8",
            phoneNum: 0,
        }).save();
    });
};

module.exports = {
    seed: seed
};