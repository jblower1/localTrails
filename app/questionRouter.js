// const messages = require("./messages")
// const rules = require("./rules")
const db = require("../db/localTrailsDb")
const keywords = require("./keywords")
const game = require("./game")

var instantiatedGames = []

//routing of incoming user messages
var routeUserMessage = function(messageBody, callback){
  const message = messageBody.Body.toLowerCase()
  const phoneNumber = messageBody.From
  var gameInProgress = gameInstantiated(phoneNumber)
  if(!gameInProgress){
    //get game id from db and instantiate a game in memory
    getNewGameDetails(phoneNumber, function(error, rows, max){
      gameInProgress = addNewGame({
        phoneNumber: phoneNumber,
        gameId: rows[0].gameid,
        teamId: rows[0].teamid,
        questionNumber: rows[0].currentquestion,
        questionText: rows[0].questiontext,
        answer: rows[0].answer,
        status: rows[0].status,
        lastQuestion: max,
        answerPoints: rows[0].answerpoints,
        penaltyPoints: rows[0].penaltypoints,
        duration: rows[0].duration
      })
      console.log("Reinstantiated game. Message being routed.")
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
    console.log("Skip requested")
    gameInProgress.skipAnswer(callback) //TODO: rework skipanswer
  } else if(keywords.isRequestingHint(message)){
    console.log("Hint requested")
    callback(gameInProgress.hint())
  } else if(keywords.isRequestingChange(message)){
    console.log("Change question requested")
    callback(gameInProgress.listeningMode(game.listeningModes.newQuestion))
  } else if(keywords.isRequestingRepeat(message)){
    console.log("Repeat question")
    callback(gameInProgress.questionText)
  } else if(keywords.isGameEnd(message)){
    console.log("End game")
    gameInProgress.endGame(true, callback)
  } else if(keywords.isGamePause(message)){
    console.log("Pause Game");
    gameInProgress.pauseGame(callback);
  }
  //answer if none of the above, do not accept an answer unless game is in play
  else if(gameInProgress.gameStarted){
    console.log("Message interpreted as an answer")
    gameInProgress.processAnswer(message, callback)
  }else{
    console.log("Message not understood")
    callback("Sorry, I'm not sure what you're trying to do.")
  }
}

function addNewGame(properties){
  var newGame = new game.Game(properties)
  instantiatedGames.push(newGame)
  return newGame
}

function gameInstantiated(phoneNumber){
  return instantiatedGames.find(function(element){
    return element.phoneNumber === phoneNumber
  })
}

function getNewGameDetails(phoneNumber, callback){
  db.getGame(phoneNumber, function(error, rows){
    if(error){
      callback(error)
    }else{
      db.getMaxQuestionNumber(rows[0].trailid, function(error, max){
        if(error){
          callback(error)
        }else{
          callback(null, rows, max)
        }
      })
    }
  })
}

module.exports.routeUserMessage = routeUserMessage
