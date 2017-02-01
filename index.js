var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/dist'));

app.listen(app.get('port'), (req, res) => {
  // enforce www
  if (req && req.headers && req.headers.host.match(/^www/) !== null ) {
    res.redirect('http://' + req.headers.host.replace(/^www\./, '') + req.url);
  }
  console.log('Node app is running on port', app.get('port'));
});
