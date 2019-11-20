require('./config/mongoose')();
const statsApp = require('./core/app/pubgStats');
statsApp.startApp();