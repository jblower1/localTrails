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
    gameInProgress = addNewGame(phoneNumber)
  }

  console.log("Message being routed.")
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
  }
  //answer if none of the above, do not accept an answer unless game is in play
  else if(gameInProgress.gameStarted){
    gameInProgress.processAnswer(message, callback)
  }else{
    callback("Sorry, I'm not sure what you're trying to do.")
  }
}

function addNewGame(phoneNumber){
  var newGame = new game.Game(phoneNumber)
  instantiatedGames.push(newGame)
  return newGame
}

function gameInstantiated(phoneNumber){
  return instantiatedGames.find(function(element){
    return element.phoneNumber === phoneNumber
  })
}

module.exports.routeUserMessage = routeUserMessage
