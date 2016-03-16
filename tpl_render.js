var jsdom = require('jsdom').jsdom;
var fs = require('fs');
var Transparency = require('transparency');

var exports = module.exports = {};

exports.renderTemplate = function (template, models, directives) {
  fs.readFile('site/' + template + '.tpl.html', 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    var doc = jsdom(data).documentElement;
    var output = 'site/' + template + '.html';
    fs.writeFile(output, Transparency.render(doc, models, directives).outerHTML);
    console.log(output + ' saved.');
  });
};
