const messages = require("./messages")
// const rules = require("./rules")
const db = require("./db/localTrailsDb")
const keywords = require("./keywords")
const game = require("./game")

var instantiatedGames = []

//routing of incoming user messages
var routeUserMessage = function(messageBody, callback){
  const message = messageBody.Body.toLowerCase()
  const phoneNumber = messageBody.From
  var gameInProgress = gameInstantiated(phoneNumber)
  if(!gameInProgress){
    //get game id from db and instantiate a new game in memory
    getNewGameDetails(phoneNumber, function(error, rows){
      gameInProgress = addNewGame(phoneNumber, rows[0].gameid, rows[0].teamid, rows[0].currentquestion)
      console.log("New game. Message being routed.")
      readMessage(message, gameInProgress, callback)
    })
  }else{
    console.log("Game exists. Message being routed.")
    readMessage(message, gameInProgress, callback)
  }
}

function readMessage(message, gameInProgress, callback){
  //Initiate conversation
  if(keywords.isRequestingWelcome(message)){
    console.log("welcome/rules requested")
    gameInProgress.getGameRules(callback)

  } else if(keywords.isRequestingGameStart(message)) {
    console.log("Start game requested")
    if(gameInProgress.gameStarted){
      callback(gameInProgress.gameInProgress())
    } else{
      gameInProgress.startGame(callback)
    } 
  } else if(keywords.isRequestingPreviousAnswers(message)){
    console.log("Previous answers requested")
    callback(gameInProgress.answers)
  } else if(keywords.isRequestingSkip(message)){
    gameInProgress.skipAnswer(callback) //TODO: rework skipanswer
  } else if(keywords.isRequestingHint(message)){
    callback(gameInProgress.currentHint())
  } else if(keywords.isRequestingChange(message)){
    callback(gameInProgress.listeningMode(game.listeningModes.newQuestion))
  } else if(keywords.isRequestingRepeat(message)){
    callback(gameInProgress.currentQuestionText)
  } else if(keywords.isGameEnd(message)){
    gameInProgress.endGame(callback)
  }
  //answer if none of the above, do not accept an answer unless game is in play
  else if(gameInProgress.gameStarted){
    console.log("Message interpreted as an answer")
    gameInProgress.processAnswer(message, callback)
  }else{
    callback("Sorry, I'm not sure what you're trying to do.")
  }
}
function addNewGame(phoneNumber, gameId, teamId, questionNumber){
  var newGame = new game.Game(phoneNumber, gameId, teamId, questionNumber)
  instantiatedGames.push(newGame)
  return newGame
}

function gameInstantiated(phoneNumber){
  return instantiatedGames.find(function(element){
    return element.phoneNumber === phoneNumber
  })
}

function getNewGameDetails(phoneNumber, callback){
  db.getGame(phoneNumber, callback)
}

function gameExists(phoneNumber, callback){
  db.getInProgressGame(phoneNumber, function(error, rows){
    if(rows[1]){

    }
  })
}

module.exports.routeUserMessage = routeUserMessage
