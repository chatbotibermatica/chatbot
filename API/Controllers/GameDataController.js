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
                fulfillmentText: 'Something went wrong!'
            });
        }
        if (teamExists) {
            return res.json({
                fulfillmentText: teamExists.description
            });
        } else {
            return res.json({
                fulfillmentText: 'Currently I am not having information about this team'
            });
        }
    });
}

function getTeamSchedule(req, res) {
    let parameters = req.body.queryResult.parameters;
    if (parameters.equipo != "") {
        let game_occurence = parameters.game_occurence;
        let team = parameters.team;
        if (game_occurence == "anterior") {
            //previous game
            GameSchedule.find({ opponent: team }, function(err, games) {
                if (err) {
                    return res.json({
                        fulfillmentText: 'Something went wrong!'
                    });
                }
                if (games.length > 0) {
                    for (var i = 0; i < games.length; i++) {
                        var game = games[i];
                        if (game.home == parameters.equipo) {
                            var winningStatement = "";
                            if (game.isWinner) {
                                winningStatement = parameters.equipo + " ganaron el partido por " + game.score;
                            } else {
                                winningStatement = parameters.equipo + " perdieron el partido por " + game.score;
                            }
                            return res.json({
                                fulfillmentText: 'El último partido entre ' + parameters.equipo + ' y ' + parameters.team + ' se jugó el ' + game.date + ' .' + winningStatement
                            });
                            //break;
                        } else {
                            var textoRespuesta = "El último partido que disputaron los " + parameters.team;
                            var winningStatement = "";
                            if (game.isWinner) {
                                winningStatement = " ganaron el partido por " + game.score + " contra los " + game.opponent;
                            } else {
                                winningStatement = " perdieron el partido por " + game.score + " contra los " + game.opponent;
                            }

                            return res.json({
                                fulfillmentText: textoRespuesta + winningStatement + ' y se jugó el ' + game.date
                            });
                        }
                    }

                } else {
                    GameSchedule.find({ home: team }, function(err, games) {
                        if (err) {
                            return res.json({
                                fulfillmentText: 'Something went wrong!'
                            });
                        }
                        if (games) {
                            for (var i = 0; i < games.length; i++) {
                                var game = games[i];

                                var textoRespuesta = "El último partido que disputaron los " + parameters.team;
                                var winningStatement = "";
                                if (game.isWinner) {
                                    winningStatement = " ganaron el partido por " + game.score + " contra los " + game.opponent;
                                } else {
                                    winningStatement = " perdieron el partido por " + game.score + " contra los " + game.opponent;
                                }

                                return res.json({
                                    fulfillmentText: textoRespuesta + winningStatement + ' y se jugó el ' + game.date
                                });
                            }

                        }
                    });
                }
            });
        } else {
            return res.json({
                fulfillmentText: 'Los póximos partidos estarán disponibles pronto'
            });
        }
    } else {
        return res.json({
            fulfillmentText: 'No puedo manejar esta petición pero la tendré en cuenta'
        });
    }
}