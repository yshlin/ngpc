var express = require('express');
var app = express();

app.use(express.static('site'));
app.listen(3000, function () {
  console.log('Site listening on port 3000!');
});
