var extend = require('extend');
var renderTemplate = require('./tpl_render').renderTemplate;
var siteConfig = require('./models/config.json');
var siteModel = require('./models/site.json');
var newsModel = require('./models/news.json');
var groupModel = require('./models/group.json');

var models = extend(true, siteConfig.site, siteModel[0], {'news': newsModel}, {'group': groupModel});

function getMetaDirective(key) {
  var dir = {
    content: function(params) {
      if ('META' == params.element.tagName) {
        return this[key];
      }
    }
  };
  if ('siteurl' == key) {
    dir['href'] = function(params) {
      if ('LINK' == params.element.tagName) {
        return this[key];
      }
    }
  }
  return dir;
}

var directives = {
  'news': {
    'newsimageurl': {
      'text': function() {
        return '';
      },
      href: function() {
        return this.newsimageurl;
      },
      style: function() {
        if (this.newsimageurl) {
          return 'background-image: url(\''+this.newsimageurl+'\');background-size: auto 100%;'
        }
      }
    }
  }
};

for (var key in models) {
  if (0 == key.indexOf('site')) {
    directives[key] = getMetaDirective(key);
  }
}

renderTemplate('index', models, directives);
