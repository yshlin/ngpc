const extend = require('extend');
const renderTemplate = require('./tpl_render').renderTemplate;
const siteConfig = require('./models/config.json');
const siteModel = require('./models/site.json');
const newsModel = require('./models/news.json');
const groupModel = require('./models/group.json');
const weeklyModel = require('./models/weekly.json');

const models = extend(true, siteConfig.site, siteModel[0], {'news': newsModel}, {'group': groupModel});

function getMetaDirective(key) {
    let dir = {
        content: function (params) {
            if ('META' === params.element.tagName) {
                return this[key];
            }
        }
    };
    if ('siteurl' === key) {
        dir['href'] = function (params) {
            if ('LINK' === params.element.tagName) {
                return this[key];
            }
        }
    }
    return dir;
}

function getImageLinkDirective(imgkey) {
    return {
        'text': function () {
            return '';
        },
        href: function () {
            return this[imgkey];
        },
        style: function () {
            if (this[imgkey]) {
                return 'background-image: url(\'' + this[imgkey] + '\');background-size: auto 100%;'
            }
        }
    }
}

function getOddClassDirective() {
    return {
        'class': function (params) {
            return params.value + ([1, 3, 5, 8, 9].includes(params.index) ? ' even' : '');
        }
    }
}

let directives = {
    'news': {
        'newsimageurl': getImageLinkDirective('newsimageurl')
    }
};

let weeklyDirectives = {
    '報告': {
        'image': getImageLinkDirective('image')
    },
    '禱告': {
        'image': getImageLinkDirective('image')
    },
    '回應詩連結': {
        'text': function (params) {
            return params.value;
        },
        href: function () {
            return '#' + this['回應詩連結'];
        }
    },
};

for (let key in models) {
    if (models.hasOwnProperty(key)) {
        if (0 === key.indexOf('site')) {
            directives[key] = getMetaDirective(key);
        }
    }
}

renderTemplate('index', models, directives);
let tpl_postfix = weeklyModel['樣版'] === '聖禮典' ? '2' : '';
renderTemplate('weekly/index' + tpl_postfix, weeklyModel, weeklyDirectives, 'weekly/index');
renderTemplate('weekly/index' + tpl_postfix, weeklyModel, weeklyDirectives, 'weekly/'+weeklyModel['pubdate']);
process.exit()  //Not sure why explicitly exit is required for windows or else it will hang