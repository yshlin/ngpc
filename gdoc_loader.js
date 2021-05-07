const request = require('request');
const fs = require('fs');
const config = require('./models/config.json');
const MODEL_TYPE = 'gdoc';
const API_PREFIX = 'https://spreadsheets.google.com/feeds/cells/';
const API_SUFFIX = '/public/full?alt=json';

module.exports = {};

function weeklyTransform(result) {
    for (let key in result) {
        if (!result.hasOwnProperty(key)) {
            continue;
        }
        let vals = result[key];
        if (key !== '' || key !== undefined) {
            if (['日期', '中文日期', '題目', '回應詩歌', '信經', '樣版', '啟應文'].includes(key)) {
                if (vals.hasOwnProperty(0)) {
                    result[key] = vals[0]['value'];
                    vals = result[key];
                }
            }
            if ('中文日期' === key) {
                result['pubdate'] = vals.replace(/[年月]/g, '-').replace(/[日]/g, '');
                result['sitetitle'] = '主日：' + vals + ' - 南園教會週報';
            } else if ('本週服侍表' === key) {
                result['敬拜'] = vals[3]['value']
                result['司會'] = vals[2]['value']
                result['講員'] = vals[1]['value']
            } else if (['經卷全名', '經卷簡寫'].includes(key)) {
                let newval = '';
                for (let i in vals) {
                    if (!vals.hasOwnProperty(i)) {
                        continue;
                    }
                    if (i > 0) {
                        newval += '; ';
                    }
                    newval+= vals[i]['value'];
                }
                result[key] = newval;
            } else if (key.startsWith('報告') || key.startsWith('禱告')) {
                let newkey = key.replaceAll(/[0-9]/g, '');
                if (!result.hasOwnProperty(newkey)) {
                    result[newkey] = [];
                }
                if (vals.hasOwnProperty(1)) {
                    result[newkey].push({
                        content: vals[0]['value'],
                        image: vals[1]['value'].replace(/^https:\/\/drive\.google\.com\/file\/d\/(.+)\/view\?usp=sharing$/, "https://drive.google.com/uc?id=$1")
                    });
                } else {
                    result[newkey].push({
                        content: vals[0]['value']
                    });
                }
            } else if (key.startsWith('詩歌')) {
                let sliceIndex = vals[0]['value'].indexOf('\n\n');
                result[key+'標題'] = vals[0]['value'].slice(0, sliceIndex);
                result[key+'內容'] = vals[0]['value'].slice(sliceIndex + 2);
                if (result[key+'標題'] === result['回應詩歌']) {
                    result['回應詩連結'] = 'song' + key.slice('詩歌'.length);
                }
            } else if (key === '經文內容') {
                let newval = [];
                for (let i = 0; i < vals.length; i += 2) {
                    if (!vals.hasOwnProperty(i)) {
                        continue;
                    }
                    let verses = vals[i]['value'].replaceAll(/\n\n/g, '\n').split('\n');
                    let contents = vals[i+1]['value'].replaceAll(/\n\n/g, '\n').split('\n');
                    for (let j in verses) {
                        if (!verses.hasOwnProperty(j) || !contents.hasOwnProperty(j)) {
                            continue;
                        }
                        newval.push({verse: verses[j], content: contents[j]});
                    }
                    newval.push({verse: ' ', content: ' '});
                }
                result[key] = newval;
            } else if (['靈修日期', '靈修進度'].includes(key)) {
                result[key].splice(0, 0, {'value': key});
            }
        }
    }
    return result;
}

function kvrowTransform(result) {
    let reshaped = {};
    for (let k in result) {
        if (!result.hasOwnProperty(k)) {
            continue;
        }
        let entry = result[k];
        if (entry.key !== '' || entry.key !== undefined) {
            let vars = [];
            for (let i = 1; i < 10; i++) {
                if (entry['value' + i] && entry['value' + i] !== '') {
                    vars.push({value: entry['value' + i]});
                }
            }
            reshaped[entry.key] = vars;
        }
    }
    return reshaped;
}

module.exports.loadModel = function (model) {
    request(API_PREFIX + model.key + API_SUFFIX, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let entries = JSON.parse(body).feed.entry;
            let result = [];
            let grid = [];
            if (entries) {
                for (let ek in entries) {
                    if (!entries.hasOwnProperty(ek)) {
                        continue;
                    }
                    let entry = entries[ek];
                    for (let k in entry) {
                        if (!entry.hasOwnProperty(k)) {
                            continue;
                        }
                        if ('gs$cell' === k) {
                            let row = parseInt(entry[k]['row']) - 1;
                            let col = parseInt(entry[k]['col']) - 1;
                            let val = entry[k]['$t'];
                            if (undefined === val || "" === val) {
                                continue;
                            }
                            if (!grid.hasOwnProperty(row) || !Array.isArray(grid[row])) {
                                grid[row] = [];
                            }
                            if (!grid[row].hasOwnProperty(col)) {
                                grid[row][col] = [];
                            }
                            grid[row][col] = val
                        }
                    }
                }
                let keys = grid[0].map(function (k) {
                    return k.replace(/ /g, '');
                });
                for (let i in grid) {
                    let r = {};
                    if (!grid.hasOwnProperty(i) || '0' === i) {
                        continue;
                    }
                    for (let j in grid[i]) {
                        if (!grid[i].hasOwnProperty(j) || !keys.hasOwnProperty(j) || undefined === keys[j] || undefined === grid[i][j]) {
                            continue;
                        }
                        r[keys[j]] = grid[i][j];
                    }
                    result.push(r);
                }
                for (let t in model.transform) {
                    if (!model.transform.hasOwnProperty(t)) {
                        continue;
                    }
                    if (model.transform[t] === 'kvrow') {
                        result = kvrowTransform(result);
                    } else if (model.transform[t] === 'weekly') {
                        result = weeklyTransform(result);
                    }
                }
                let output = 'models/' + model.name + '.json';
                fs.writeFileSync(output, JSON.stringify(result, null, 2));
                console.log(output + ' saved.')
            }
        }
    });
};

if (require.main === module) {
    //Load all gdoc models
    for (let model of config.models) {
        if (model.type === MODEL_TYPE) {
            module.exports.loadModel(model);
        }
    }
}
