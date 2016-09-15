// create a new sqlite database
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;
if(env === 'production') {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgress'
    });
} else {
    sequelize = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': __dirname + '/data/dev-todo-api.sqlite'
    });
}


var db = {};

// import model to the database
db.todo = sequelize.import(__dirname + '/models/todo.js');
db.sequelize = sequelize;
db.Sequelzie = Sequelize;

module.exports = db;