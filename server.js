var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
var bcrypt = require('bcryptjs');
var db = require('./db');
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

// GET /todos
app.get('/todos', function(req, res) {
    var query = req.query;
    var where = {};
    if(query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if(query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if(query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }

    db.todo.findAll({where: where}).then(function(todos) {
        res.json(todos);
    }, function(e) {
        res.sendStatus(500);
    });
});

// GET /todos/id
app.get('/todos/:id', function(req, res)  {
    var todoId = parseInt(req.params.id, 10);
    db.todo.findById(todoId).then(function(todo) {
        if(!!todo) {
            res.json(todo.toJSON());
        } else {
            res.sendStatus(404);
        }
    }, function(e) {
        res.sendStatus(500);
    });

});

// POST /todos
app.post('/todos', function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    db.todo.create(body).then(function(todo) {
        res.json(todo.toJSON());
    }, function (e) {
        res.sendStatus(400).json(e);
    });
});

//PUT /todos/:id
app.put('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};

    if(body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.sendStatus(400);
    }

    if(body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findById(todoId).then(function(todo) {
        if (todo) {
            todo.update(attributes).then(function(todo) {
                res.json(todo.toJSON());
            }, function(e) {
                res.sendStatus(400).json(e);
        });;
        } else {
            res.sendStatus(404);
        }
    }, function() {
        res.sendStatus(500);
    });
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    db.todo.destroy({
        where: {
            id:todoId
        }
    }).then(function(rowsDeleted) {
        if(rowsDeleted === 0) {
            res.sendStatus(404).json({
                error: 'No todo with id'
            });
        } else {
             res.sendStatus(204)
        }
    }, function() {
        res.sendStatus(500);
    } );
});

// GET /users
app.get('/users', function(req, res) {
    var query = req.query;
    var where = {};
    if(query.hasOwnProperty('email') && query.email.length > 0) {
        where.password = query.email;
    }

    db.user.findAll({where: where}).then(function(users) {
        res.json(users);
    }, function(e) {
        res.sendStatus(500).json(e);
    });
});

// GET /user/:id
app.get('/users/:id', function(req, res) {
    var userId = parseInt(req.params.id, 10);
    db.user.findById(userId).then(function(user) {
        if(!!user) {
            res.json(user.toPublicJSON());
        } else {
            res.sendStatus(404);
        }
    }, function(e) {
        res.sendStatus(404).json(e);
    })
});

// POST /users
app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');
    db.user.create(body).then(function(user) {
        res.json(user.toPublicJSON());
    }, function (e) {
        res.sendStatus(400).json(e);
    });
});

// PUT /users/:id
app.put('/users/:id', function(req, res) {
    var userId = parseInt(req.params.id, 10);
    var body = _.pick(req.body, 'email', 'password');
    var attributes = {};

    if(body.hasOwnProperty('email')) {
        attributes.email = body.email;
    }

    if(body.hasOwnProperty('password')) {
        attributes.password = body.password;
    }

    db.user.findById(userId).then(function(user) {
        if (user) {
            user.update(attributes).then(function(user) {
                res.json(user.toJSON());
            }, function(e) {
                res.sendStatus(400).json(e);
        });
        } else {
            res.sendStatus(404);
        }
    }, function() {
        res.sendStatus(500);
    });
});

//DELETE /users/:id
app.delete('/users/:id', function(req, res) {
    var userId = parseInt(req.params.id, 10);
    db.user.destroy({
        where: {
            id: userId
        }
    }).then(function(rowsDeleted) {
        if(rowsDeleted === 0) {
            res.json({
                error: 'No user with this ID found'
            });
        } else {
            res.sendStatus(204);
        }
    }, function() {
        res.sendStatus(500);
    });
});

// POST /users/login
app.post('/users/login', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');
    
    db.user.authenticate(body).then(function(user) {
        res.json(user.toPublicJSON());
    }, function() {
        res.sendStatus(401);
    });

    /*
    */
});


// Create Model
db.sequelize.sync({force: true}).then(function() {
    app.listen(PORT, function() {
        console.log('express listening on port ' + PORT);
    })
});

