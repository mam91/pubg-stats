const request = require('request');
const zlib = require('zlib');
const damageCauserDict = require('./damageCauserName.json');

exports.getTelemetryFile = async function(url) {
    return new Promise(function (resolve, reject) {
        request(url, { encoding: null }, function (err, response, body) {
            zlib.gunzip(body, function (err, dezipped) {
                var tData = JSON.parse(dezipped);
        
                var filtered = tData.filter(function (data) {
                    return data._T === 'LogPlayerKill' || data._T === 'LogPlayerMakeGroggy' || data._T === 'LogPlayerTakeDamage' || data._T === 'LogPlayerAttack';
                });
                
                resolve(filtered);
            });
        });
    });
}

exports.getPlayerKills = function(telemetryData, name) {
    var killed = telemetryData.filter(function(data) {
        if(data.killer) {
            return data._T === 'LogPlayerKill' && name === data.killer.name;
        }
    });

    var playersKilled = []

    for(var i = 0; i < killed.length; i++) {
        var by = ""

        var name = "";

        if(killed[i].victim && killed[i].victim.name) {
            name = killed[i].victim.name;
        }

        if(killed[i].damageTypeCategory === 'Damage_Groggy') {
            //get DBNO id
            var dbnoId = killed[i].dBNOId;

            if(dbnoId < 0) {
                by = damageCauserDict[killed[i].damageCauserName];
            }

            //get DBNOs for the current victim
            var dbnos = telemetryData.filter(function(data) {
                if(data.victim) {
                    return data._T === 'LogPlayerMakeGroggy' && data.dBNOId === dbnoId;
                }
            });

            by = damageCauserDict[dbnos[0].damageCauserName];
        }
        else {
            by = damageCauserDict[killed[i].damageCauserName];
        }

        playersKilled.push({ name :name, by : by, distance : Math.round(killed[i].distance / 100)});
    }

    return playersKilled;
}

exports.getPlayerDeath = function(telemetryData, name) {
    var deathData = telemetryData.filter(function(data) {
        if(data.victim) {
            return data._T === 'LogPlayerKill' && name === data.victim.name;
        }
    });

    var death = {};
    var d_by = '';
    var distance = 0;

    if(deathData && deathData.length > 0) {

        if(deathData[0].damageTypeCategory === 'Damage_Groggy') {
            //get DBNO id
            var dbnoId = deathData[0].dBNOId;

            if(dbnoId < 0) {
                d_by = damageCauserDict[deathData[0].damageCauserName];
            }

            //get DBNOs for the current victim
            var dbnos = telemetryData.filter(function(data) {
                if(data.victim) {
                    return data._T === 'LogPlayerMakeGroggy' && data.dBNOId === dbnoId;
                }
            });

            d_by = damageCauserDict[dbnos[0].damageCauserName];
            distance = dbnos[0].distance;
        }
        else {
            d_by = damageCauserDict[deathData[0].damageCauserName];
            distance = deathData[0].distance;
        }

        var killerName = deathData[0].killer ? deathData[0].killer.name : deathData[0].victim.name;

        death = { name : killerName , by : d_by, distance : Math.round(distance / 100) }
    }
    return death;
}

exports.getPlayerDamageBreakdown = function(telemetryData, name) {
    var filtered = telemetryData.filter(function (data) {
        if(data.attacker) {
            return data._T == 'LogPlayerTakeDamage' && data.attacker.name === name && data.victim.name != name;
        } 
    });

    var damageList = {}
    for(var i = 0; i < filtered.length; i++) {
        if(damageList[damageCauserDict[filtered[i].damageCauserName]]) {
            damageList[damageCauserDict[filtered[i].damageCauserName]] += filtered[i].damage;
        }
        else {
            damageList[damageCauserDict[filtered[i].damageCauserName]] = filtered[i].damage;
        }
    }

    var damageArray = []

    var fieldPadLen = 0;
    for(var key in damageList) {
        if(key.length > fieldPadLen) {
            fieldPadLen = key.length;
        }
    }

    for(var key in damageList) {
        if(damageList[key] != 0) {
            var obj = {}
            obj[key] = Math.round(damageList[key]);
            obj.pad = fieldPadLen;
            damageArray.push(obj);
        }
    }

    return damageArray;
}

exports.getGrenadeThrows = function(telemetryData, name) {
    var filtered = telemetryData.filter(function (data) {
        if(data.attacker) {
            return data._T == 'LogPlayerAttack' && data.weapon.itemId === 'Item_Weapon_Grenade_C' && data.attacker.name === name;
        } 
    });
    return filtered.length;
}

