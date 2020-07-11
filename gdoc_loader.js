var request = require('request');
var fs = require('fs');
var config = require('./models/config.json');
var MODEL_TYPE = 'gdoc';
var API_PREFIX = 'https://spreadsheets.google.com/feeds/list/';
var API_SUFFIX = '/public/values?alt=json';

var exports = module.exports = {};

exports.loadModel = function(model) {
  request(API_PREFIX + model.key + API_SUFFIX, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var entries = JSON.parse(body).feed.entry;
      if (entries) {
        var result = entries.map(function(entry) {
          var data = {};
          for (var key in entry) {
            if (0 == key.indexOf('gsx$')) {
              data[key.substr(4)] = entry[key]['$t'];
            }
          }
          return data;
        });
        var output = 'models/' + model.name + '.json';
        fs.writeFileSync(output, JSON.stringify(result, null, 2));
        console.log(output + ' saved.')
      }
    }
  });
};

if (require.main === module) {
  //Load all gdoc models
  for (var model of config.models) {
    if (model.type == MODEL_TYPE) {
      exports.loadModel(model);
    }
  }
}
