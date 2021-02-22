const db = require("./db/localTrailsDb")

const listeningModes = {
    standard: "STANDARD",
    newQuestion: "NEWQUESTION"
}
module.exports.listeningModes = listeningModes

module.exports.Game = class{
    constructor(phoneNumber){
    //   this.gameId = gameId 
      this.phoneNumber = phoneNumber
      this.questionNumber = 0
      this.gameStarted = false
      this.timesAnsweredIncorrect = 0
      this.listeningMode = listeningModes.standard
      this.currentQuestionText = ""
      this.currentHint = ""
      this.currentAnswer = ""
    }

    startGame(callback){
        this.endGame()
        this.gameStarted = true
        console.log("Trail started")
        this.nextQuestion()
        this.getQuestionData(this.questionNumber, callback)
    }

    getQuestionData(questionId, callback){
        db.getQuestionText(questionId, function(rows){
          console.log("Callback from DB...")
          console.log(rows)
          callback(this.extractQuestion(rows))
        }.bind(this))
      }
      
    extractQuestion(rows){
        if(rows[0].questiontext){
          this.currentQuestionText = rows[0].questiontext
          this.currentAnswer = rows[0].answer
          this.currentHint = rows[0].hint
          return this.currentQuestionText
        }else{
          this.currentQuestionText = ""
          this.currentAnswer = ""
          this.currentHint = ""
          return "No remaining questions!"
        }
      }
    endGame(){
        this.gameStarted = false
        this.resetAnswers()
    }
    
    resetAnswers(){
      // TODO: reset answers when they are persisted
    }

    isAnswerCorrect(userAnswer){
        //TODO: determine if answers are correct for tracking persistency1
        return this.currentAnswer.toUpperCase() === userAnswer.toUpperCase()
    }
    
    nextQuestion(){
        this.questionNumber = this.questionNumber + 1
    }
    gameInProgress(){
        return "A game is already in progress."
    }
    processAnswer(message, callback){
        if(this.isAnswerCorrect(message)){
          this.nextQuestion()
          this.getQuestionData(this.questionNumber, function(question){
            callback(`Well done! ${message} was correct. \n\n ${question}`)
          })
        }
        else{
          this.timesAnsweredIncorrect++
          callback("Bad luck! Try again")
        }
    }
      
    skipAnswer(callback){
        console.log("Question skipped")
        // setExpectingQuestion()
        this.nextQuestion()
        this.getQuestionData(this.questionNumber, function(question){
          callback(`Question skipped. You can try this one again later. \n\n ${question}`)
        })
      }
      
    getHint(){
        console.log("Getting hint")
        
    }
      
    getGameRules(callback){
        var rules;
        db.getRules(function(rows){
          console.log("Callback from DB...")
          console.log(rows)
          //callback with the rows from the db. This propagates back up the calls.
          callback(this.buildRuleString(rows))
        }.bind(this))
    }
      
    buildRuleString(rows){
        return rows.reduce(function(acc, curr){
          return acc += ` ${curr.ruledesc}\n\n`
        }, "")
    }
    setQuestion(number){
        if(number === "next"){
          this.nextQuestion()
        }else{
          questionNumber = parseInt(number)
        }
        console.log("Question Number: " + questionNumber)
      }
    get phoneNumber(){
        return this._phoneNumber
    }
    set phoneNumber(phoneNumber){
        this._phoneNumber = phoneNumber
    }
    get questionNumber(){
        return this._questionNumber
    }
    set questionNumber(questionNumber){
        this._questionNumber = questionNumber
    }
    get gameStarted(){
        return this._gameStarted
    }
    set gameStarted(isStarted){
        this._gameStarted = isStarted
    }
    get timesAnsweredIncorrect(){
        return this._timesAnsweredIncorrect
    }
    set timesAnsweredIncorrect(timesAnsweredIncorrect){
        this._timesAnsweredIncorrect = timesAnsweredIncorrect
    }
    get listeningMode(){
        return this._listeningMode
    }
    set listeningMode(listeningMode){
        this._listeningMode = listeningMode
    }
    get currentQuestionText(){
        return this._currentQuestionText
    }
    set currentQuestionText(currentQuestionText){
        this._currentQuestionText = currentQuestionText
    }
    get currentHint(){
        return "Hints are currently not supported. See if you can answer without."
        // return this._currentHint
    }
    set currentHint(currentHint){
        this._currentHint = currentHint
    }
    get currentAnswer(){
        return this._currentAnswer
    }
    set currentAnswer(currentAnswer){
        this._currentAnswer = currentAnswer
    }
    get answers(){
        //TODO: Implement logic for this
        return "Placeholder to return previous answers"
    }
  }