const { Client } = require('pg')
const { ModelBuildPage } = require('twilio/lib/rest/autopilot/v1/assistant/modelBuild')
const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB,
    password: process.env.DB_USER_PW
})
client.connect()

module.exports.getRules = function(callback){
  console.log("Getting rules from db")
  client.query('SELECT ruledesc FROM rules ORDER BY ruleorder ASC', function(err, res){
    if(err){
      // console.log(err)
      // client.end()
      callback(new Error("Sorry, there was a problem reading from the database"))
    }else if(res){
      // console.log(res.rows)
      // client.end()
      callback(null, res.rows)
    }
  })
}

module.exports.getQuestionText = function(questionId, callback){
  // console.log("Getting question")
  client.query('SELECT questiontext, answer, hint FROM questions WHERE questionid = $1', [questionId], function(err, res){
    if(err){
      // console.log(err)
      // client.end()
      callback(new Error("Sorry, there was a problem reading from the database"))
    }else if(res){
      // console.log(res.rows)
      // client.end()
      callback(null, res.rows)
    }
  })
}

//use whatsapp number to get team ID, map that back to a game that is in play
module.exports.getInProgressGame = function(phoneNumber, callback){
  client.query('select games.gameid, ' +
                'players.teamid ' + 
                'from players inner join games' + 
                'on players.teamid = games.teamid' + 
                'where players.phonenumber = $1 and games.currentquestion > 0', [phoneNumber], function(err, res){
    if(err){
      // console.log(err)
      // client.end()
      callback(new Error("Sorry, there was a problem reading from the database"))
    }else if(res){
      // console.log(res.rows)
      // client.end()
      callback(null, res.rows)
    }
  })
}

module.exports.getGame = function(phoneNumber, callback){
  // client.query('select games.gameid, ' +
  //               'players.teamid ' + 
  //               'from players inner join games' + 
  //               'on players.teamid = games.teamid' + 
  //               'where players.phonenumber = $1', [phoneNumber], function(err, res){
  client.query('select games.gameid, games.currentquestion, players.teamid from players inner join games on players.teamid = games.teamid where players.phonenumber = $1', [phoneNumber], function(err, res){
    if(err){
      callback(new Error("Sorry, there was a problem reading from the database"))
    }else if(res){
      callback(null, res.rows)
    }
  })
}

module.exports.startGame = function(gameId, callback){
  client.query('update games set status = $2 where gameid = $1 and status != $3', [gameId, 'IN_PROGRESS', 'COMPLETED'], function(err, res){
    if(err){
      callback(new Error('There was a problem starting this game.'))
    }else if(res){
      callback(null, res.rowCount)
    }
  })
}

module.exports.setQuestion = function(gameId, teamId, question, callback){
  client.query('update games set currentquestion = $1 where gameid = $2 and teamid = $3', [question, gameId, teamId], function(err, res){
    if(err){
      callback(new Error('There was a problem saving the question data.'))
    }else if(res){
      callback(null, res.rowCount)
    }
  })
}

module.exports.endGame = function(gameId, teamId, status, callback){
  client.query('update games set status = $1 where gameid = $2 and teamid = $3', [status, gameId, teamId], function(err, res){
    if(err){
      callback(new Error('There was a problem ending this game.'))
    }else if(res){
      callback(null, res.rowCount)
    }
  })
}

module.exports.pauseGame = function(){

}

module.exports.saveGame = function(){

}
// client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
//   console.log(err ? err.stack : res.rows[0].message) // Hello World!
//   client.end()
// })
