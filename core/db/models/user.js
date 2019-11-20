const mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    name: {
        type: String,
        required: '{PATH} is required!',
        unique:true
    },
    pubgId : {
        type: String,
        unique : true
    },
    matches : {
        type: [String]
    }
    // ,
    // info : { 
    //     firstName: {type: String, required: '{PATH} is required'},
    //     lastName: {type: String, required: '{PATH} is required'},
    // },
    // created: {type: Date },
    // lastLogin: {type: Date },
	// salt: {type: String, required: '{PATH} is required'},
    // password: {type: String, required: '{PATH} is required'},
    // failedLogins : { type: Number },
    // passwordExpiry : { type : Boolean },
    // passwordExpiryDate : { type : Date },
});

// userSchema.methods.create = (firstName, lastName, email, salt, password, passwordExpiry, callback) => {
//     User.create({ email : email, info : { firstName : firstName, lastName : lastName }, salt : salt, password : password, created : new Date(), passwordExpiry : passwordExpiry, failedLogins : 0 }, function(err, user) {
//         return callback(err, user)
//     });  
// }  


userSchema.methods.getUsers = (callback) => {
    User.find({}).exec(function (err, collection) {
        return callback(err, collection);
    });
}  

userSchema.methods.getUser = (name, callback) => {
    User.findOne({ name : name }).exec(function (err, collection) {
        return callback(err, collection);
    });
}  

userSchema.methods.updateUser = (name, updates, callback) => {
    User.findOneAndUpdate({ name : name }, updates, {upsert:true}, function(err, doc){
        return callback(err, doc)
    });
}  

// userSchema.methods.deleteUser = (email, callback) => {
//     User.deleteOne({ email : email }).exec(function (err, collection) {
//         return callback(err, collection);
//     });
// }  

var User = mongoose.model('User', userSchema);
module.exports = mongoose.model('User');