const express = require('express');
const handlebars = require('express-handlebars');
const { urlencoded } = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/passport');
const helpers = require('./_helpers');

const app = express();
const port = process.env.PORT || 3000;

var server = require('http').createServer(app)
var io = require('socket.io')(server)

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

app.use(express.static(__dirname + '/public'));
app.engine(
  'handlebars',
  handlebars({
    defaultLayout: 'main.handlebars',
    helpers: require('./config/handlebars-helpers'),
  })
);
app.set('view engine', 'handlebars');
// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()

// body-parser
app.use(urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use('/upload', express.static(__dirname + '/upload'));

const sessionMiddleware = session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
});
app.use(sessionMiddleware)
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = helpers.getUser(req);
  next();
});

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next)
})
require('./controllers/webSocketController')(io)

server.listen(port, () => console.log(`Example app listening on port ${port}!`));

require('./routes')(app);

module.exports = app;
