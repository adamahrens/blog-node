var express = require('express')
var mongoose = require('mongoose')
var parser = require('body-parser');
var morgan = require('morgan');
var methodOverride = require('method-override');
var app = express();

app.set('view engine', 'ejs');
app.use(parser.urlencoded({ extended: true})); /* Parsing BODY on POST requests */
app.use(methodOverride('_method')) /* Allow PUT, DELETE form requests to route correctly */
app.use(morgan('combined'));  /* HTTP Logging to STDOUT */
app.use('/semantic', express.static('semantic'))
app.use(express.static('public'))

mongoose.connect('mongodb://localhost/blog', { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection to database error:'));
db.once('open', function() {
  console.log('connection to database successful');
});

// Schema
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: { type: Date, default: Date.now }
});

// Construct Model
var Blog = mongoose.model('Blog', blogSchema);

// REST Routes

// INDEX
app.get('/blogs', function(request, response) {
  Blog.find({}, function(error, blogs) {
    if (error) {
      console.log('Error fetching blogs ' + error);
    }

    var finalBlogs = error ? [] : blogs
    response.render('index', { blogs: blogs });
  })
  .sort({ '_id' : -1 });
});

// CREATE
app.post('/blogs', function(request, response) {
  Blog.create(request.body.blog, function(error, blog) {
    if (error) {
      console.log('Error saving blog: ' + error);
      response.render('new');
    } else {
      response.redirect('/blogs');
    }
  });
});

// NEW
app.get('/blogs/new', function(request, response) {
  response.render('new');
});

// SHOW
app.get('/blog/:id', function(request, response) {
  var id = request.params.id;
  Blog.findById(id, function(error, blog) {
    if (error) {
      console.log('Erroring showing blog: ' + error);
      response.redirect('/blogs');
    } else {
      response.render('show', { blog: blog });
    }
  });
});

// EDIT
app.get('/blogs/:id/edit', function(request, response) {
  var id = request.params.id;
  Blog.findById(id, function(error, blog) {
    if (error) {
      console.log('Erroring showing blog: ' + error);
      response.redirect('/blogs');
    } else {
      response.render('edit', { blog: blog });
    }
  });
});

// UPDATE
app.put('/blogs/:id', function(request, response) {
  var id = request.params.id;
  Blog.findByIdAndUpdate(id, request.body.blog, function (error, blog) {
    if (error) {
      console.log('Erroring Updating blog. Redirecting... : ' + error);
      response.redirect('/blogs/' + id + '/edit');
    } else {
      response.redirect('/blog/' + id)
    }
  });
});

// ROOT
app.get('/', function(request, response){
  response.redirect('/blogs');
});

app.listen(3001, function() {
  console.log('Server listening on 3001');
});
