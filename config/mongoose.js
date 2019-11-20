const mongoose = require('mongoose');
// const userModel = require('../api/data/models/user');
// const courseModel = require('../models/Course');


module.exports = function (config) {
    mongoose.connect( 'mongodb+srv://user@passhere@cluster0-azhle.mongodb.net/pubg?retryWrites=true&w=majority', { useNewUrlParser: true } ); 
    console.log("MongoDb connected");
    // var db = mongoose.connection;

    // db.on('error', console.error.bind(console, 'connection error...'));
    // db.once('open', function callback() {
    //     console.log('multivision db opened');
    // });


    // userModel.createDefaultUsers();
    // courseModel.createDefaultCourses();
};