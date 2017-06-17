var express = require('express')
var bodyparser = require('body-parser')
var path = require('path')
var expressValidator = require('express-validator')
var mongojs = require('mongojs')


var app = express();

// // Custom Middleware
// var logger = function(request, respose, next) {
//   console.log("Logging...");
//   next();
// }
//
// /** Middleware Registrations **/
// // Custom Middleware
// app.use(logger);

// Bodyparser Middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded( { extended: false }));

// Set Static Path
app.use(express.static(path.join(__dirname, 'assets')));

// Global Vars
app.use(function(request, response, next) {
  response.locals.errors = null; // ?
  next();
});

// Express Validator Middleware
// In this example, the formParam value is going to get morphed into form body format useful for printing.
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// View Engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Database Connection
var db = mongojs('customerapp', ['users'])


// -------------------  Data  ------------------
var person = {
  name: 'jeff',
  age: '30'
}

var users = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'johndoe@gmail.com'
  },
  {
    id: 2,
    first_name: 'Joe',
    last_name: 'Root',
    email: 'joeroot@gmail.com'
  },
  {
    id: 3,
    first_name: 'Jill',
    last_name: 'Jackson',
    email: 'jilljackson@gmail.com'
  }
]
// -------------------  Data  ------------------


// ------------------  Routes  ------------------

app.get('/', function(request, response) {
  // Static data
  // var data = {
  //   "title": "Customer",
  //   "users": users
  // };

  db.users.find(function(error, docs) {
    var data = {
      "title": "Customer",
      "users": docs
    };
    response.render('index', data);
  })
})

app.post('/users/add', function(request, response) {

  // Validation
  request.checkBody('first_name', "First Name is Required").notEmpty();
  request.checkBody('last_name', "Last Name is Required").notEmpty();
  request.checkBody('email', "Email is Required").notEmpty();

  var errors = request.validationErrors();
  if(errors) {
    var data = {
      "title": "Customer",
      "users": users,
      "errors": errors
    };

    response.render('index', data);
  } else {
    var user = {
      id: users.length + 1,
      first_name: request.body.first_name,
      last_name: request.body.last_name,
      email: request.body.email
    }
    // users.push(user);
    // var data = {
    //   "title": "Customer",
    //   "users": users
    // };
    db.users.insert(user, function(error, result) {
      if(!error) {
        response.redirect("/")
      }
    });
  }
})

// ------------------  Routes  ------------------

app.listen(3000, function() {
  console.log('Server started on Port 3000..')
});
