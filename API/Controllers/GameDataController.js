'use strict';
var mongoose = require('mongoose');
var TeamInfo = mongoose.model('TeamInfo');
var GameSchedule = mongoose.model('GameSchedule');

exports.processRequest = function(req, res) {
    if (req.body.queryResult.action == "schedule") {
        getTeamSchedule(req, res)
    } else if (req.body.queryResult.action == "team-info") {
        getTeamInfo(req, res)
    }
};

function getTeamInfo(req, res) {
    let teamToSearch = req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.team ? req.body.queryResult.parameters.team : 'Unknown';
    TeamInfo.findOne({ name: teamToSearch }, function(err, teamExists) {
        if (err) {
            return res.json({
                speech: 'Something went wrong!',
                fulfillmentText: 'Something went wrong!',
                source: 'team info'
            });
        }
        if (teamExists) {
            return res.json({
                speech: teamExists.description,
                fulfillmentText: teamExists.description,
                source: 'team info'
            });
        } else {
            return res.json({
                speech: 'Currently I am not having information about this team',
                fulfillmentText: 'Currently I am not having information about this team',
                source: 'team info'
            });
        }
    });
}

function getTeamSchedule(req, res) {
    let parameters = req.body.queryResult.parameters;
    if (parameters.team1 == "") {
        let game_occurence = parameters.game_occurence;
        let team = parameters.team;
        if (game_occurence == "previous") {
            //previous game
            GameSchedule.find({ opponent: team }, function(err, games) {
                if (err) {
                    return res.json({
                        speech: 'Something went wrong!',
                        fulfillmentText: 'Something went wrong!',
                        source: 'game schedule'
                    });
                }
                if (games) {
                    for (var i = 0; i < games.length; i++) {
                        var game = games[i];
                        if (game.home == parameters.equipo) {
                            var winningStatement = "";
                            if (game.isWinner) {
                                winningStatement = "Kings won this match by " + game.score;
                            } else {
                                winningStatement = "Kings lost this match by " + game.score;
                            }
                            return res.json({
                                speech: 'Last game between Kings and ' + parameters.team + ' was played on ' + game.date + ' .' + winningStatement,
                                fulfillmentText: 'Last game between Kings and ' + parameters.team + ' was played on ' + game.date + ' .' + winningStatement,
                                source: 'game schedule'
                            });
                            //break;
                        } else {
                            return res.json({
                                speech: 'Cant find any previous game played between Kings and ' + parameters.team,
                                fulfillmentText: 'Cant find any previous game played between Kings and ' + parameters.team,
                                source: 'game schedule'
                            });
                        }
                    }

                }
            });
        } else {
            return res.json({
                speech: 'Next game schedules will be available soon',
                fulfillmentText: 'Next game schedules will be available soon',
                source: 'game schedule'
            });
        }
    } else {
        return res.json({
            speech: 'Cant handle the queries with two teams now. I will update myself',
            fulfillmentText: 'Cant handle the queries with two teams now. I will update myself',
            source: 'game schedule'
        });
    }
}