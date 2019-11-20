'use strict';

const fs = require('fs');
const request = require('request');

// let rawdata = fs.readFileSync('telem.json');
// let telem = JSON.parse(rawdata);
// console.log(telem);

const url = 'https://telemetry-cdn.playbattlegrounds.com/bluehole-pubg/steam/2019/08/28/17/48/07964037-c9bc-11e9-9cfe-0a586467e77b-telemetry.json';

const zlib = require('zlib');

const itemIdsDict = require('./core/pubg/itemIds.json');

request(url, { encoding: null }, function (err, response, body) {
    zlib.gunzip(body, function (err, dezipped) {
        var tData = JSON.parse(dezipped);

        console.log

        var filtered = tData.filter(function (data) {
            // && data.damageTypeCategory != 'Damage_Gun';
            //return data._T === 'LogPlayerKill' || data._T === 'LogPlayerMakeGroggy';

            if(data.attacker) {
                return data._T == 'LogPlayerAttack' && data.weapon.itemId === 'Item_Weapon_Grenade_C' && data.attacker.name === 'MuZi-DongSheng';
            }
            
        });

        console.log(filtered);
        console.log(filtered.length);

        // var strip = filtered.filter(function(data) {
        //     if(data.victim) {
        //         return data.victim.name == 'MuZi-DongSheng';
        //     }
        // });

        // console.log(strip);
    });
}); //1644167169,


// request.get({ url: url, headers : { 'Accept': 'application/vnd.api+json', 'Accept-encoding' : 'gzip', 'encoding' : null}, json: true}, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//         var importedJSON = JSON.parse(body);
//         console.log(response.headers);
//      }
//     // if (err) {
//     //     console.log(err);
//     //     reject(err);
//     // }
//     // else {
//     //     // var tData = response;
//     //     // console.log(response);
//     //     var filtered = tData.filter(function(data) {
//     //         return data._T === 'LogPlayerKill'
//     //     });
//     //     resolve(filtered);
//     // }
// });

// var filtered = telem.filter(function(data) {
//     return data._T === 'LogPlayerKill'
// });

// console.log(filtered);
// console.log(filtered.length);

// var players = ["PdSe_Coke", "BlckSwallow"]

// var killedBy = filtered.filter(function(data) {
//     if(data.killer) {
//         return players.indexOf(data.killer.name) >= 0;
//     }
//     else if(data.victim) {
//         return players.indexOf(data.victim.name) >= 0;
//     }
// });

// console.log(killedBy);

// for ( var i = 0; i < killedBy.length; i++) {

// }