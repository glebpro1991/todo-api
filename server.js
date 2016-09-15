var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db');
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

// GET /todos
app.get('/todos', function(req, res) {
    var queryParams = req.query;
    var filteredTodos = todos;

    //search by parameter
    if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, { completed:true });
    } else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, { completed: false});
    }

    //do string match search
    if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        filteredTodos = _.filter(filteredTodos, function(todo) {
            return todo.description.toLowerCase().indexOf(queryParams.q) > -1;
        });
    }

    res.json(filteredTodos);
});

// GET /todos/id
app.get('/todos/:id', function(req, res)  {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, { id: todoId});
    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.sendStatus(404);
    }
});

// POST /todos
app.post('/todos', function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    db.todo.create(body).then(function(todo) {
        res.json(todo.toJSON());
    }, function (e) {
        res.sendStatus(400).json(e);
    });

    /*

    if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(400);
    }

    body.description = body.description.trim();
    body.id = todoNextId++;;
    todos.push(body);
    res.send('success');
    */
});

//PUT /todos/:id
app.put('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, { id: todoId });
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};

    if(!matchedTodo){
        return res.sendStatus(404);
    }
    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.sendStatus(400);
    }

    if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.sendStatus(400);
    }

    _.extend(matchedTodo, validAttributes);

});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, { id: todoId});

    if(!matchedTodo) {
        res.sendStatus(404).json({"error" : "no todo found with that id"});
    } else {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    }
});

db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log('express listening on port ' + PORT);
    })
});

