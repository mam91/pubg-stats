exports.getUsers = async function () {
    const userModel = require('./models/user')();

    return new Promise(function (resolve, reject) {

        userModel.getUsers(function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });
}


exports.updateUser = async function (name, id, matches) {
    const userModel = require('./models/user')();

    var updates = { pubgId : id, matches : matches }

    return new Promise(function (resolve, reject) {
        userModel.updateUser(name, updates, function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });
}