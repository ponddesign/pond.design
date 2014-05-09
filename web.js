'use strict';

var path     = require('path'),
    express  = require('express'),
    partials = require('express-partials');

var app = module.exports = express();

//== Configurations

app.set('port', (process.env.PORT || 5000));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname + '/public')))
app.use('/assets', express.static(path.join(__dirname + '/assets')))

//== Middlware

app.use(partials())

// app.use(logfmt.requestLogger());

app.all('/', function (req, res) {
  res.render('www/index.ejs');
});

app.listen(app.get('port'), function () {
  console.log('Express server listening on port %d (%s)', app.get('port'), app.get('env'))
});
