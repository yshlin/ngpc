// const request = require('request');
const https = require('https');
const fs = require('fs');
const config = require('./models/config.json');
const MODEL_TYPE = 'gdoc';
const API_PREFIX = 'https://docs.google.com/spreadsheets/d/';
const API_SUFFIX = '/gviz/tq?tqx=out:json&sheet=';

module.exports = {};

function weeklyTransform(result) {
    for (let key in result) {
        if (!result.hasOwnProperty(key)) {
            continue;
        }
        let vals = result[key];
        if (key !== '' || key !== undefined) {
            if (['日期', '中文日期', '題目', '回應詩歌', '信經', '樣版', '啟應文標題'].includes(key)) {
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
                    newval += vals[i]['value'];
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
                result[key + '標題'] = vals[0]['value'].slice(0, sliceIndex);
                result[key + '內容'] = vals[0]['value'].slice(sliceIndex + 2);
                if (result[key + '標題'] === result['回應詩歌']) {
                    result['回應詩連結'] = 'song' + key.slice('詩歌'.length);
                }
            } else if (key === '經文內容') {
                let newval = [];
                for (let i = 0; i < vals.length; i += 2) {
                    if (!vals.hasOwnProperty(i)) {
                        continue;
                    }
                    let verses = vals[i]['value'].replaceAll(/\n\n/g, '\n').split('\n');
                    let contents = vals[i + 1]['value'].replaceAll(/\n\n/g, '\n').split('\n');
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
            } else if (key === '講綱') {
                let newvals = [];
                if (vals[0] && vals[0].hasOwnProperty('value')) {
                    let agenda = vals[0]['value'].split('\n');
                    for (let i in agenda) {
                        if (agenda.hasOwnProperty(i)) {
                            newvals.push({'value': agenda[i].trim()});
                        }
                    }
                    result[key] = newvals
                }
            } else if (key === '啟應文內容') {
                let scriptureLines = vals[0]['value'].split("\n");
                let newvals = [];
                for (let i = 0; i < scriptureLines.length; ) {
                    let call = "";
                    let resp = "";
                    if (scriptureLines[i].startsWith("（齊）")) {
                        resp = scriptureLines[i];
                    }
                    else {
                        call = scriptureLines[i];
                        i++;
                        resp = scriptureLines[i];
                    }
                    i++;
                    newvals.push({content: call, content2: resp});
                }
                result[key] = newvals
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
            for (let i = 1; i <= 10; i++) {
                if (entry['value' + i] && entry['value' + i] !== '') {
                    vars.push({value: entry['value' + i]});
                }
            }
            reshaped[entry.key] = vars;
        }
    }
    return reshaped;
}

function parseGdocJsonToGridLegacy(entries) {
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
    }
    return grid;
}

function stripJsonp(jsonp) {
    return jsonp.substring(jsonp.indexOf('{'), jsonp.lastIndexOf('}') + 1);
}

function parseGdocCtdpJsonToGrid(entries) {
    let grid = [];
    if (entries) {
        let i = 0;
        for (let er of entries) {
            let entry = er.c;
            let j = 0;
            for (let val of entry) {
                if (!grid.hasOwnProperty(i) || !Array.isArray(grid[i])) {
                    grid[i] = [];
                }
                // if (!grid[i].hasOwnProperty(j)) {
                //     grid[i][j] = [];
                // }
                if (val && val.hasOwnProperty('v') && null !== val.v) {
                    grid[i][j] = val.v;
                }
                j++;
            }
            i++;
        }
    }
    return grid;
}

function parseGdocCtdpJsonToHead(cols) {
    let head = [];
    if (cols) {
        for (let col of cols) {
            if (col.label) {
                head.push(col.label);
            }
        }
    }
    return head;
}

module.exports.loadModel = function (model) {
    return new Promise((resolve, reject) => {
        let apiUrl = API_PREFIX + model.key + API_SUFFIX + model.subkey;
        https.get(apiUrl, function (response) {
            console.log(apiUrl);
            if (response.statusCode === 200) {
                response.setEncoding('utf8');
                let rawData = '';
                response.on('data', (chunk) => {
                    rawData += chunk;
                });
                response.on('end', () => {
                    try {
                        let t = JSON.parse(stripJsonp(rawData));
                        let thead = t.table.cols;
                        let entries = t.table.rows;
                        let result = [];
                        let grid = parseGdocCtdpJsonToGrid(entries);
                        let keys = parseGdocCtdpJsonToHead(thead).map(function (k) {
                            return k.replace(/ /g, '');
                        });
                        for (let r of grid) {
                            let row = {};
                            let j = 0;
                            for (let v of r) {
                                if (v) {
                                    row[keys[j]] = v;
                                }
                                j++;
                            }
                            result.push(row);
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
                        setTimeout(() => {
                            resolve(model.name);
                        }, 5000);
                    } catch (e) {
                        setTimeout(() => {
                            reject(e);
                        }, 5000);
                    }
                });

            } else {
                setTimeout(() => {
                    reject(response.statusCode);
                }, 5000);
            }
        });
    });
};


if (require.main === module) {
    //Load all gdoc models
    mod = process.argv[2];
    let prom = Promise.resolve();
    for (let i = 0; i < config.models.length; i++) {
        prom = prom.then((result) => {
            let model = config.models[i];
            if (model.type === MODEL_TYPE && (undefined === mod || model.name === mod)) {
                console.log(result);
                console.log(model.name);
                return module.exports.loadModel(model);
            } else {
                return Promise.resolve();
            }
        }).catch(e => {
            console.log(e);
        });
    }
    prom.then((result) => {
        console.log(result);
    }).catch(e => {
        console.log(e);
    });

}
