const jsdom = require('jsdom').jsdom;
const fs = require('fs');
const Transparency = require('transparency');


module.exports.renderTemplate = function (template, models, directives, target) {
  let data = fs.readFileSync('site/' + template + '.tpl.html', 'utf8');
  let doc = jsdom(data).documentElement;
  if (undefined === target) {
    target = template;
  }
  let output = 'site/' + target + '.html';
  fs.writeFileSync(output, Transparency.render(doc, models, directives).outerHTML);
  console.log(output + ' saved.');
};
