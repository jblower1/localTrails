//********************************keyword requests
module.exports.isRequestingPreviousAnswers = function(message){
  return message === "my answers" || message === "answers"
}

module.exports.isRequestingRepeat = function(message){
  return message === "repeat"
}

module.exports.isRequestingSkip = function(message){
  return message === "skip"
}

module.exports.isRequestingHint = function(message){
  return message === "hint"
}

module.exports.isRequestingChange = function(message){
  return message === "change"
}

module.exports.isRequestingWelcome = function(message){
  return message === "hello" || message === "hi" || message === "hey" || message === "rules"
}

module.exports.isRequestingGameStart = function(message){
  return message === "start"
}
