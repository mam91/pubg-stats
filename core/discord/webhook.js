const request = require('request');
// const webhookUrl = 'https://discordapp.com/api/webhooks/571327607405150221/KDx-3MKo8STReYiPE5EKkuXRH3s1Un4X5d9z-_iiJaDdTHsSKzPU6UYFIoqn69N19pc8';
const webhookUrl = "https://discordapp.com/api/webhooks/571339992249532457/LGJJ2sz2628Roq67puaAEbdA2zxeZVw8A_NefaBwqM1_bweO3cau0F9DIPkU1z_il75x";
const cardGenUrl = 'http://localhost:5000/pubg/match/generatecard';

exports.sendMatchStats = async function (match) {
    console.log("Posting to discord");
    const body = {}
    var bodyAddl = { }

    var content = "";

    var header = "```Mode : " + match.mode + "\nMap  : " + match.map + "\nRank : " + match.rank + "\nTime : " + match.createdAt + "\n";

    if(match.players.len == 0) {
        console.log("No match players");
        return;
    }

    const keys = Object.keys(match.players[0]);

    const keyPad = 12;
    var borderLenStr = "";

    var biggestKillList = 0;
    var biggestDamageList = 0;

    var appendNewline = true;

    for (const key of keys) {
        appendNewline = true;
        for (var i = 0; i < match.players.length; i++) {
            if (key === 'name') {
                //Need to capture the line length here
                borderLenStr += rightPad("" + fieldName + ": " + match.players[i][key], 35, ' ');
            }
            if(key === 'playerKills') {
                if(match.players[i][key].length > biggestKillList) {
                    biggestKillList = match.players[i][key].length;
                }
                appendNewline = false;
                continue;
            }
            else if(key === 'death') {
                appendNewline = false;
                continue;
            }
            else if(key === 'damageBreakdown') {
                if(match.players[i][key].length > biggestDamageList) {
                    biggestDamageList = match.players[i][key].length;
                }
                appendNewline = false;
                continue;
            }

            var fieldName = key.padEnd(keyPad);
            content += rightPad("" + fieldName + ": " + match.players[i][key], 35, ' ');
        }

        if(appendNewline === true) {
            content += "\n";
        }
    }

    var killFeeds = "";
    for (var i = 0; i < match.players.length; i++) {
        killFeeds += "Killed".padEnd("35");
    }
    killFeeds += "\n";

    for ( var i = 0; i < biggestKillList; i++) {
        for (var k = 0; k < match.players.length; k++) {
            if (match.players[k]['playerKills'] && match.players[k]['playerKills'][i]) {
                killFeeds += rightPad("" + match.players[k]['playerKills'][i].name + " by " + match.players[k]['playerKills'][i].by + " (" + match.players[k]['playerKills'][i].distance + " m)", 35, ' ');
            }
            else {
                killFeeds += rightPad("-", 35, ' ');
            }
        }
        killFeeds += "\n";
    }

    var deathFeed = "\n";
    for (var i = 0; i < match.players.length; i++) {
        deathFeed += "Death".padEnd("35");
    }
    deathFeed += "\n";
    for (var i = 0; i < match.players.length; i++) {
        if(match.players[i].death && match.players[i].death.name) {
            deathFeed += rightPad(match.players[i].death.name + " by " + match.players[i].death.by + " (" + match.players[i].death.distance + " m)", 35, ' ');
        }
        else {
            deathFeed += rightPad("-", 35, ' ');
        }
    }
    deathFeed += "\n\n";


    var dmgFeeds = "\n";
    for (var i = 0; i < match.players.length; i++) {
        dmgFeeds += "Damage Breakdown".padEnd("35");
    }
    dmgFeeds += "\n";

    for ( var i = 0; i < biggestDamageList; i++) {
        for (var k = 0; k < match.players.length; k++) {
            if (match.players[k]['damageBreakdown'] && match.players[k]['damageBreakdown'][i]) {
                var key = Object.keys(match.players[k]['damageBreakdown'][i]);
                var field = key[0].padEnd(match.players[k]['damageBreakdown'][i]["pad"]);
                dmgFeeds += rightPad(field + " : " + match.players[k]['damageBreakdown'][i][key[0]], 35, ' ');
            }
            else {
                dmgFeeds += rightPad("-", 35, ' ');
            }
        }
        dmgFeeds += "\n";
    }


    header += "".padEnd(borderLenStr.trimRight().length, '_') + "\n\n";

    body.content = header + content;

    bodyAddArr = [ deathFeed, killFeeds, dmgFeeds ]

    var addedAddl = false;

    var i = 0;
    for(i = 0; i < bodyAddArr.length; i++) {
        if((body.content + bodyAddArr[i]).length < 2000) {
            body.content += bodyAddArr[i];
        }
        else {
            if(addedAddl === false) {
                bodyAddl.content = "```";
                addedAddl = true;
            }
            bodyAddl.content += bodyAddArr[i];
        }
    }

    if(addedAddl === true) {
        bodyAddl.content += "```";
    }
    body.content += "```";

    // if((body.content + deathFeed).length < 2000 ) {
    //     body.content = body.content + deathFeed;
    // }

    // if((body.content + deathFeed).length < 2000 ) {
    //     body.content = body.content + deathFeed;
    // }

    // bodyAddl.content = "```" + deathFeed + killFeeds + dmgFeeds + "```";

    // body.embeds = []
    // body.embeds.push({ footer : "Hello "});

    return new Promise(function (resolve, reject) {
        request.post({ url: webhookUrl, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }, function (err, response) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                // console.log(response);
                // resolve(response);
                if(bodyAddl && bodyAddl.content) {
                    request.post({ url: webhookUrl, body: JSON.stringify(bodyAddl), headers: { 'Content-Type': 'application/json' } }, function (err, response) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        }
                        else {
                            // console.log(response);
                            resolve(response);
                        }
                    });
                }
            }
        });
    });
}

exports.sendImage = async function (match) {
    request.post({ url: cardGenUrl, body: JSON.stringify(match), headers: { 'Content-Type': 'application/json' } }, function (err, response) {
        if (err) {
            console.log(err);
            reject(err);
        }
        else {
            console.log(response);
            resolve(response);
        }
    });
}

function rightPad(str, len, pad) {
    for(var i = str.length; i < len; i++) {
        str += pad;
    }
    return str;
}