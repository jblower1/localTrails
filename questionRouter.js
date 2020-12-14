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
var currentQuestion = 0

var routeMessage = function(messageBody){
  const message = messageBody.Body.toLowerCase()
  console.log("Routing message")
  console.log("Expecting question? " + question )
  console.log("Message Receieved: " + message)
  //console.log("Message as Number: " + Number.isInteger(parseInt(message)))

  if(isExpectingAnswer()){
    return processAnswer(message)
  }

  if(isExpectingQuestion()){
    return processQuestion(message)
  }
}

var processQuestion = function(message){
  if(message === "start" && questionNumber === 0) {
      setExpectingQuestion()
      setQuestion(1)
      return messages.start
  } else if(isQuestionFormat(message) && isExpectingQuestion()){
      //tell the system we are now expecting an answer to the question that is about to be presented to the user
      setExpectingAnswer()
      setQuestion(message)
      console.log("Now ready to receive an question? " + question)
      return getQuestionText()
  } else {
      setExpectingQuestion()
      console.log("Now ready to receive an question? " + question)
      return "Sorry, I don't recognise what you're trying to do. Please either start the game or request a question number"
  }
}

var processAnswer = function(message){
  nextQuestion()
  setExpectingQuestion()
  if(message === "skip"){
    return skipAnswer()
  }else{
    return "Thanks for your answer. Please enter a question number or type \"next\"."
  }
}

var skipAnswer = function(){
  console.log("Question skipped")
  setExpectingQuestion()
  return "Sure, please request a new question. You can try this one again later."
}

var isAnswerCorrect = function(){

}

var checkAnswer = function(answer){

}

var nextQuestion = function(){
  questionNumber++
}

var getQuestionText = function(){
  return messages[questionNumber] ? messages[questionNumber] : "Sorry there is no question with this number"
}

var setQuestion = function(number){
  if(number === "next"){
    nextQuestion()
  }else{
    questionNumber = parseInt(number)
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
