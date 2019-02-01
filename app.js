var express = require('express')
var mongoose = require('mongoose')
var parser = require('body-parser');
var morgan = require('morgan');
var app = express();

app.set('view engine', 'ejs');
app.use(parser.urlencoded({ extended: true})); /* Parsing BODY on POST requests */
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

// Dummy data
// Blog.create({ title: 'My Dummy Blog', body: 'This is some dummy blog data to work with', image: 'https://images.unsplash.com/photo-1525382455947-f319bc05fb35?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2828&q=80'})

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
      response.render('show', { blog: blog});
    }
  });
});

app.get('/', function(request, response){
  response.redirect('/blogs');
});

app.listen(3001, function() {
  console.log('Server listening on 3001');
});
