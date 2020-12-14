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

//state of answers
var question = true
var questionNumber = 0
var gameStarted = false

var routeMessage = function(messageBody){
  const message = messageBody.Body.toLowerCase()

  console.log("Message being routed.")
  if(isGameRestart(message)){
    endGame()
    return processQuestion("start")
  }

  if(isRequestingPreviousAnswers(message)){
    setExpectingQuestion()
    return "Placeholder to return previous answers"
  }

  if(isExpectingAnswer()){
    return processAnswer(message)
  }

  if(isExpectingQuestion()){
    return processQuestion(message)
  }
}

var processQuestion = function(message){
  if(message === "start" && !gameStarted) {
      startGame()
      console.log("Trail started")
      setExpectingQuestion()
      // setQuestion(1)
      return messages.start
  } else if(gameStarted && isExpectingQuestion() && isQuestionFormat(message)){
      //tell the system we are now expecting an answer to the question that is about to be presented to the user
      console.log("Message is a question request")
      setExpectingAnswer()
      setQuestion(message)
      // console.log("Now ready to receive an question? " + question)
      return getQuestionText()
  } else {
      console.log("Could not process incoming message")
      setExpectingQuestion()
      console.log("Now ready to receive an question? " + question)
      return "Sorry, I don't recognise what you're trying to do. Please either start the game or request a question number"
  }
}

var processAnswer = function(message){
  console.log("Message is an answer")
  nextQuestion()
  setExpectingQuestion()
  if(message === "skip" || message === "next"){
    return skipAnswer()
  }else{
    return "Thanks for your answer. Please enter a question number or type \"next\"."
  }
}

var isRequestingPreviousAnswers = function(message){
  return message === "show me my answers"
}

var skipAnswer = function(){
  console.log("Question skipped")
  setExpectingQuestion()
  return "Sure, please request a new question. You can try this one again later."
}

var restartGame = function(){

}

var startGame = function(){
  gameStarted = true
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

var checkAnswer = function(answer){

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

var isQuestionFormat = function(message){
  return message === "next" || Number.isInteger(parseInt(message))
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


module.exports.routeMessage = routeMessage
