const battlegrounds = require('battlegrounds')
const dbCtx = require('../db/controller');
const discord = require('../discord/webhook');
const telemetry = require('../pubg/telemetry');

exports.startApp = async function () {
    //Load users to monitor
    console.log("Loading users");
    var users = await dbCtx.getUsers();

    var found = users.map(function (item) {
        return item.name;
    })

    console.log("Found users: " + found.join());

    //start monitoring users
    const api = new battlegrounds('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzMTMwMmVjMC00YTU2LTAxMzctNDE3Mi03M2NjYjY0YzEyNTYiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTU2Mjg1Nzc3LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6Ii1lZTdhYTJlYi1iYmYwLTRiNmEtOGMzZC1mZDRhYjEzMzczMTUifQ.EunhA4oJsRi7q81eRWeAJx4PzSzC9ktP7BECU3tsFZY', 'pc-na')
    var interval = 60000;

    setInterval(async function(){
        var apiPlayers = await api.getPlayers({ names: found.join() })

        var matchesAlreadyProcessed = []
        
        for(var i = 0; i < apiPlayers.length; i++) {
            var apiPlayer = apiPlayers[i];
    
            var name = apiPlayer.attributes.name;
            var pubgId = apiPlayer.id;
            var matches = apiPlayer.matches.map(function (item) {
                return item.id;
            })
    
            var userIndex = users.map(function(e) { return e.name; }).indexOf(name);

            console.log(matches.length);
            console.log(users[userIndex].matches.length);
    
            var matchesToProcess = []
            if(userIndex >= 0) {
                matchesToProcess = getArrayDifference(matches, users[userIndex].matches);
            }
            else {
                matchesToProcess = matches;
            }

            // matchesToProcess.push(matches[0]);
    
            if(matchesToProcess.length > 0) {
                console.log("Found " + matchesToProcess.length + " matches to process");
    
                //send to discord
                for(var k = 0; k < matchesToProcess.length; k++) {
                    if(matchesAlreadyProcessed.indexOf(matchesToProcess[k]) >= 0) {
                        console.log("Already processed match: " + matchesToProcess[k]);
                        continue;
                    }
                    else {
                        //send to discord  
                        var apiMatch = await api.getMatch({id : matchesToProcess[k]});
    
                        var telemetryUrl = apiMatch.assets[0].attributes.URL;
                        var telemetryData = await telemetry.getTelemetryFile(telemetryUrl);
    
                        var mapDict = require('../pubg/mapName.json');
    
                        var match = {
                            mode: apiMatch.attributes.gameMode,
                            map: mapDict[apiMatch.attributes.mapName],
                            timeAlive: apiMatch.attributes.duration,
                            shardId: apiMatch.attributes.shardId,
                            createdAt: new Date(apiMatch.attributes.createdAt).toLocaleString()
                        }
    
                        var rosterIndexes = searchRostersForNames(apiMatch.rosters, found);

                        console.log(rosterIndexes);
    
                        rosterIndexes.forEach(function (e) {
                            var roster = apiMatch.rosters[e];
    
                            var rank = roster.attributes.stats.rank;
                            var players = []
    
                            for(var p = 0; p < roster.participants.length; p++) {
                                var player = {
                                    name : roster.participants[p].attributes.stats.name,
                                    damage : Math.round(roster.participants[p].attributes.stats.damageDealt),
                                    kills : roster.participants[p].attributes.stats.kills,
                                    dbnos : roster.participants[p].attributes.stats.DBNOs,
                                    headshots : roster.participants[p].attributes.stats.headshotKills,
                                    revives : roster.participants[p].attributes.stats.revives,
                                    longestKill : Math.round(roster.participants[p].attributes.stats.longestKill) + " m"
                                }
    
                                player.playerKills = telemetry.getPlayerKills(telemetryData, roster.participants[p].attributes.stats.name);
                                player.death = telemetry.getPlayerDeath(telemetryData, roster.participants[p].attributes.stats.name);
                                player.damageBreakdown = telemetry.getPlayerDamageBreakdown(telemetryData, roster.participants[p].attributes.stats.name);
                                player.fragsThrown = telemetry.getGrenadeThrows(telemetryData, roster.participants[p].attributes.stats.name);
    
                                players.push(player);
                            }
    
                            match.rank = rank;
                            match.players = players;
    
                            discord.sendMatchStats(match);
                        });
    
                        matchesAlreadyProcessed.push(matchesToProcess[k]);
                    }
                }
    
                //update mongo
                var response = await dbCtx.updateUser(name, pubgId, matches);
                //update memory
                users[userIndex].matches = matches;
            }
            else {
                //console.log("No matches to process for player " + name);
            }
        }
        console.log("Sleeping for " + interval / 1000 + " seconds.");
    }, interval);
    

    // console.log("Exiting app");
    // process.exit();
}

function getArrayDifference(arr1, arr2) {
    var missingItems = []
    for(var i = 0; i < arr1.length; i++) {
        if(arr2.indexOf(arr1[i]) < 0) {
            missingItems.push(arr1[i]);
        }
    }
    return missingItems;
}

function searchRostersForNames(rosters, names) {
    var rosterIndexes = []
    for(var i = 0; i < rosters.length; i++) {
        for(var k = 0; k < rosters[i].participants.length; k++) {
            // console.log(rosters[i].participants[k].attributes);
            if(names.indexOf(rosters[i].participants[k].attributes.stats.name) >= 0) {
                if(rosterIndexes.indexOf(i) < 0) {
                    // console.log("Pushing roster index: " + i + " because found user :" + rosters[i].participants[k].attributes.stats.name);
                    rosterIndexes.push(i);
                }
            }
        }
    }

    return rosterIndexes;
}