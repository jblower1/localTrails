const db = require("./db/localTrailsDb")


const listeningModes = {
    standard: "STANDARD",
    newQuestion: "NEWQUESTION"
}
module.exports.listeningModes = listeningModes

module.exports.Game = class{
    constructor(phoneNumber, gameId, teamId, questionNumber){
    //   this.gameId = gameId 
      this.phoneNumber = phoneNumber
      this.gameId = gameId
      this.teamId = teamId
      this.questionNumber = questionNumber
      this.gameStarted = false
      this.timesAnsweredIncorrect = 0
      this.listeningMode = listeningModes.standard
      this.currentQuestionText = ""
      this.currentHint = ""
      this.currentAnswer = ""
    }

    startGame(callback){
        // this.endGame()
        db.startGame(this.gameId, function(error, rowCount){
            if(error){
                callback(error)
            }else if(rowCount > 0){
                console.log("Trail started")
                this.gameStarted = true
                // this.nextQuestion()
                this.getQuestionData(this.questionNumber, callback)    
            }else if(rowCount === 0){
                callback("I'm sorry, this game has already been completed.")
            }
        }.bind(this))
    }

    getQuestionData(questionId, callback){
        db.getQuestionText(questionId, function(error, rows){
          callback(error, this.extractQuestion(rows))
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
          return "No remaining questions! If you're ready to finish your experience, type \"end\"."
        }
      }
    endGame(callback){
        db.endGame(this.gameId, this.teamId, "COMPLETED", function(error, rowcount){
            if(error){
                callback(error)
            }else if(rowcount > 0){
                callback('Thanks for playing this local trail!')
            }
        })
    }
    
    resetAnswers(){
      // TODO: reset answers when they are persisted
    }

    isAnswerCorrect(userAnswer){
        return this.currentAnswer.toUpperCase() === userAnswer.toUpperCase()
    }
    // nextQuestion(responseMessage){

    // }
    nextQuestion(callback){
        this.timesAnsweredIncorrect = 0
        this.questionNumber = this.questionNumber + 1
        db.setQuestion(this.gameId, this.teamId, this.questionNumber, callback)
    }
    gameInProgress(){
        return "A game is already in progress."
    }
    processAnswer(message, callback){
        if(this.isAnswerCorrect(message)){
        //   this.nextQuestion()
            this.nextQuestion(function(error, rowcount){
                if(!error){
                    this.getQuestionData(this.questionNumber, function(error, question){
                        if(error){
                            callback(error)
                        }else if(rowcount > 0){
                            callback(`Well done! ${message} was correct.\n\n ${question}`)
                        }
                    })
                }
            }.bind(this))
        }
        else{
          //TODO: write incorrect answer data to database (answers table)
          this.timesAnsweredIncorrect++
          callback("Bad luck! Try again")
        }
    }

    skipAnswer(callback){
        console.log("Question skipped")
        this.nextQuestion(function(error, rowcount){
            if(!error){
                this.getQuestionData(this.questionNumber, function(error, question){
                    if(error){
                        callback(error)
                    }else if(rowcount > 0){
                        callback(`Question skipped. You can try this one again later. \n\n ${question}`)
                    }
                })
            }
        }.bind(this))
      }
    //TODO: Try to incorporate nextQuestionReply instead of anonymous function in process answer and skip answer
    nextQuestionReply(error, rowcount, callback){
            if(!error){
                this.getQuestionData(this.questionNumber, function(error, question){
                    if(error){
                        callback(error)
                    }else if(rowcount > 0){
                        callback(`Question skipped. You can try this one again later. \n\n ${question}`)
                    }
                })
            }
        }        
     
    getHint(){
        console.log("Getting hint")
        
    }
      
    getGameRules(callback){
        db.getRules(function(error, rows){
          //callback with the rows from the db. This propagates back up the calls.
          callback(error, this.buildRuleString(rows))
        }.bind(this))
    }
      
    buildRuleString(rows){
        return rows.reduce(function(acc, curr){
          return acc += `${curr.ruledesc}\n\n`
        }, "")
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
        return this._currentHint ? this._currentHint : "This question does not currently have a hint"
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

// module.exports.Question = class Question{
//     constructor(){
//         this.questionText = ""
//         this.questionNumber = ""
//         this.correctAnswer = ""
//         this.timesAnsweredIncorrect = 0
//         this.points = 5
//     }
//     get questionText = function(){
//         return this._questionText;
//     }
//     get questionNumber
// }