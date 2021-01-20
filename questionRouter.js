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
const db = require("./db/localtrails")

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

//routing of incoming user messages
var routeUserMessage = function(messageBody, callback){
  const message = messageBody.Body.toLowerCase()

  console.log("Message being routed.")
  //Initiate conversation
  if(isRequestingWelcome(message)){
    console.log("welcome/rules requested")
    getGameRules(function(rules){
      callback(rules)
    })

  }
  //start/restart game
  if(isRequestingGameStart(message)) {
    console.log("Start game requested")
     return gameStarted ? gameInProgress() : startGame()
  }
  //my answers
  if(isRequestingPreviousAnswers(message)){
    // setExpectingQuestion()
    console.log("Previous answers requested")
    return getAnswers()
  }
  //skip answer
  if(isRequestingSkip(message)){
    return skipAnswer() //TODO: rework skipanswer
  }
  //hint
  if(isRequestingHint(message)){
    return getHint()
  }
  //change answer/retake question
  if(isRequestingChange(message)){
    return setListeningMode(listeningModes.newQuestion)
  }
  //repeat
  if(isRequestingRepeat(message)){
    return getQuestionText()
  }
  //answer if none of the above, do not accept an answer unless game is in play
  if(gameStarted){
    return processAnswer(message)
  }else{
    return "Sorry, I'm not sure what you're trying to do."
  }

}


var processQuestion = function(message){
  if(gameStarted && isExpectingQuestion() && isQuestionFormat(message)){
      //tell the system we are now expecting an answer to the question that is about to be presented to the user
      console.log("Message is a question request")
      setExpectingAnswer()
      setQuestion(message)
      // console.log("Now ready to receive an question? " + question)
      return getQuestionText()
  }
  else {
      console.log("Could not process incoming message")
      setExpectingQuestion()
      console.log("Now ready to receive an question? " + question)
      return "Sorry, I don't recognise what you're trying to do. Please either start the game or request a question number"
  }
}

var processAnswer = function(message){
  console.log("Message is an answer")
  if(isAnswerCorrect()){
    nextQuestion()
    return "Well done. That's correct! \n\n" + getQuestionText()
  }
  else{
    timesAnsweredIncorrect++
    return "Bad luck! Try again"
  }
}




var gameInProgress = function(){
  return "A game is already in progress."
}

var skipAnswer = function(){
  console.log("Question skipped")
  // setExpectingQuestion()
  nextQuestion()
  return "Question skipped. You can try this one again later. \n\n" +
         getQuestionText()
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

var startGame = function(){
  endGame()
  gameStarted = true
  console.log("Trail started")
  nextQuestion()
  return getQuestionText()
  // setExpectingQuestion()
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

var isAnswerCorrect = function(){
//TODO: determine if answers are correct for tracking persistency1
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

var getQuestionText = function(){
  const questionObj = messages[questionNumber]
  if(questionObj){
    return questionObj.q
  }else{
    setExpectingQuestion()
    return "Sorry there is no question with this number"
  }
}
//
// var isQuestionFormat = function(message){
//   return message === "next" || Number.isInteger(parseInt(message))
// }

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

//********************************keyword requests
var isRequestingPreviousAnswers = function(message){
  return message === "my answers" || message === "answers"
}

var isRequestingRepeat = function(message){
  return message === "repeat"
}

var isRequestingSkip = function(message){
  return message === "skip"
}

var isRequestingHint = function(message){
  return message === "hint"
}

var isRequestingChange = function(message){
  return message === "change"
}

var isRequestingWelcome = function(message){
  return message === "hello" || message === "hi" || message === "hey" || message === "rules"
}

var isRequestingGameStart = function(message){
  return message === "start"
}


module.exports.routeUserMessage = routeUserMessage
