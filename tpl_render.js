const jsdom = require('jsdom').jsdom;
const fs = require('fs');
const Transparency = require('transparency');


module.exports.renderTemplate = function (template, models, directives, target) {
  fs.readFile('site/' + template + '.tpl.html', 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    let doc = jsdom(data).documentElement;
    if (undefined === target) {
      target = template;
    }
    var output = 'site/' + target + '.html';
    fs.writeFileSync(output, Transparency.render(doc, models, directives).outerHTML);
    console.log(output + ' saved.');
  });
};
