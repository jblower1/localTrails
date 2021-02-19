// {
//    SmsMessageSid: 'SM2da198160ae42e24995b17e4d49e3a46',
//    NumMedia: '0',
//    SmsSid: 'SM2da198160ae42e24995b17e4d49e3a46',
//    SmsStatus: 'received',
//    Body: 'Hello',
//    To: 'whatsapp:+14155238886',
//    NumSegments: '1',
//    MessageSid: 'SM2da198160ae42e24995b17e4d49e3a46',
//    AccountSid: 'AC8a0bd93cdca1316294f79f8b8036224f',
//    From: 'whatsapp:+447931312860',
//    ApiVersion: '2010-04-01'
//  }

const messages = require("./messages")
// const rules = require("./rules")
const db = require("./db/localTrailsDb")
const keywords = require("./keywords")

const listeningModes = {
  standard: "STANDARD",
  newQuestion: "NEWQUESTION"
}

//game data
var question = true //probably don't need this anymore
var questionNumber = 0
var gameStarted = false //status of the game (in progress or not)
var timesAnsweredIncorrect = 0 //this field will be used to calculate deducted points
var listeningMode = listeningModes.standard //listening mode will change how messages from the user are interpreted

var currentQuestionText = ""
var currentHint = ""
var currentAnswer = ""


//routing of incoming user messages
var routeUserMessage = function(messageBody, callback){
  const message = messageBody.Body.toLowerCase()

  console.log("Message being routed.")
  //Initiate conversation
  if(keywords.isRequestingWelcome(message)){
    console.log("welcome/rules requested")
    getGameRules(function(rules){
      callback(rules)
    })

  }
  //start/restart game
  else if(keywords.isRequestingGameStart(message)) {
    console.log("Start game requested")
    if(gameStarted) return gameInProgress()
    else startGame(function(question){
       callback(question)
     })
  }
  //my answers
  else if(keywords.isRequestingPreviousAnswers(message)){
    // setExpectingQuestion()
    console.log("Previous answers requested")
    callback(getAnswers())
  }
  //skip answer
  else if(keywords.isRequestingSkip(message)){
    skipAnswer(callback) //TODO: rework skipanswer
  }
  //hint
  else if(keywords.isRequestingHint(message)){
    callback(getHint())
  }
  //change answer/retake question
  else if(keywords.isRequestingChange(message)){
    callback(setListeningMode(listeningModes.newQuestion))
  }
  //repeat
  else if(keywords.isRequestingRepeat(message)){
    callback(currentQuestionText)
  }
  //answer if none of the above, do not accept an answer unless game is in play
  else if(gameStarted){
      processAnswer(message, callback)
  }else{
    callback("Sorry, I'm not sure what you're trying to do.")
  }

}

var processAnswer = function(message, callback){
  if(isAnswerCorrect(message)){
    nextQuestion()
    getQuestionData(questionNumber, function(question){
      callback(`Well done! ${message} was correct. \n\n ${question}`)
    })
  }
  else{
    timesAnsweredIncorrect++
    callback("Bad luck! Try again")
  }
}

var gameInProgress = function(){
  return "A game is already in progress."
}

var skipAnswer = function(callback){
  console.log("Question skipped")
  // setExpectingQuestion()
  nextQuestion()
  getQuestionData(questionNumber, function(question){
    callback(`Question skipped. You can try this one again later. \n\n ${question}`)
  })
}

var getHint = function(){
  console.log("Getting hint")
  return "Hints are currently not supported. See if you can answer without."
}

var getGameRules = function(callback){
  var rules;
  db.getRules(function(rows){
    console.log("Callback from DB...")
    console.log(rows)
    //callback with the rows from the db. This propagates back up the calls.
    callback(buildRuleString(rows))
  })
}

var buildRuleString = function(rows){
  return rows.reduce(function(acc, curr){
    return acc += ` ${curr.ruledesc}\n\n`
  }, "")
}

var startGame = function(callback){
  endGame()
  gameStarted = true
  console.log("Trail started")
  nextQuestion()
  getQuestionData(questionNumber, callback)
}

var getQuestionData = function(questionId, callback){
  db.getQuestionText(questionId, function(rows){
    console.log("Callback from DB...")
    console.log(rows)
    callback(extractQuestion(rows))
  })
}

var extractQuestion = function(rows){
  if(rows[0].questiontext){
    currentQuestionText = rows[0].questiontext
    currentAnswer = rows[0].answer
    currentHint = rows[0].hint
    return currentQuestionText
  }else{
    currentQuestionText = ""
    currentAnswer = ""
    currentHint = ""
    return "No remaining questions!"
  }
  // return rows[0].questiontext ? rows[0].questiontext : rows
}
var isGameRestart = function(message){
  return message === "restart"
}

var endGame = function(){
    gameStarted = false
    resetAnswers()
}

var resetAnswers = function(){
  // TODO: reset answers when they are persisted
}

var isAnswerCorrect = function(userAnswer){
//TODO: determine if answers are correct for tracking persistency1
  return currentAnswer.toUpperCase() === userAnswer.toUpperCase()
}

var getAnswers = function(){
  //TODO: Implement logic for this
  return "Placeholder to return previous answers"
}

//Set question variables
var revertQuestion = function(){

}

var nextQuestion = function(){
  questionNumber++
}

var setQuestion = function(number){
  if(number === "next"){
    nextQuestion()
  }else{
    questionNumber = parseInt(number)
  }
  console.log("Question Number: " + questionNumber)
}

var getQuestionTextLocal = function(){
  const questionObj = messages[questionNumber]
  if(questionObj){
    return questionObj.q
  }else{
    setExpectingQuestion()
    return "Sorry there is no question with this number"
  }
}

var setListeningMode = function(mode){
  listeningMode = mode
}

var isExpectingQuestion = function(){
  return question
}

var isExpectingAnswer = function(){
  return !question
}

var setExpectingQuestion = function(){
  question = true
}

var setExpectingAnswer = function(){
  question = false
}

module.exports.routeUserMessage = routeUserMessage
