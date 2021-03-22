const db = require("./db/localTrailsDb");

const listeningModes = {
  standard: "STANDARD",
  newQuestion: "NEWQUESTION",
};
module.exports.listeningModes = listeningModes;

module.exports.Game = class {
  constructor(properties) {
    ({
      phoneNumber: this.phoneNumber,
      gameId: this.gameId,
      teamId: this.teamId,
      questionNumber: this.questionNumber,
      questionText: this.questionText,
      answer: this.answer,
      hint: this.hint,
      lastQuestion: this.lastQuestion,
    } = properties);
    this.gameStarted = properties.status === "IN_PROGRESS";
    this.listeningMode = listeningModes.standard;
    this.timesAnsweredIncorrect = 0;
  }
  /**
   * Start the game
   * @param {function} callback do the callback 
   */
  startGame(callback) {
    db.startGame(
      this.gameId,
      function (error, rowCount) {
        if (error) {
          callback(error);
        } else if (rowCount > 0) {
          console.log("Trail started");
          this.gameStarted = true;
          // this.nextQuestion()
          this.getQuestionData(this.questionNumber, callback);
        } else if (rowCount === 0) {
          callback("I'm sorry, this game has already been completed.");
        }
      }.bind(this)
    );
  }
  /**
   * Get all  necessary question data from DB
   * @param {integer} questionId id of the question
   * @param {function} callback callback function
   */
  getQuestionData(questionId, callback) {
    console.log("About to get question");
    db.getQuestionText(
      questionId,
      function (error, rows) {
        this.extractQuestion(rows);
        callback(error);
      }.bind(this)
    );
  }

  extractQuestion(rows) {
    if (rows[0].questiontext) {
      this.questionText = rows[0].questiontext;
      this.answer = rows[0].answer;
      this.hint = rows[0].hint;
      this.direction = rows[0].nextdirection;
      return this.questionText;
    } else {
      this.questionText = "";
      this.answer = "";
      this.hint = "";
      return 'No remaining questions! If you\'re ready to finish your experience, type "end".';
    }
  }
  endGame(userInput, callback) {
    db.endGame(
      this.gameId,
      this.teamId,
      "COMPLETED",
      function (error, rowcount) {
        if (error) {
          callback(error);
        } else if (rowcount > 0 && !userInput) {
          callback("Congratulations, you have completed the trail!");
        } else if (rowcount > 0 && userInput) {
          callback("You've ended the game.Thanks for playing this local trail");
        }
      }
    );
  }

  resetAnswers(callback) {
    // TODO: reset answers when they are persisted
    callback("Sorry, resetting answers is not supported yet.");
  }

  isAnswerCorrect(userAnswer) {
    return this.answer.toUpperCase() === userAnswer.toUpperCase();
  }
  // nextQuestion(responseMessage){

  // }
  nextQuestion(callback) {
    console.log("Setting next question");
    this.timesAnsweredIncorrect = 0;
    this.questionNumber = this.questionNumber + 1;
    db.setQuestion(this.gameId, this.teamId, this.questionNumber, callback);
  }
  gameInProgress() {
    return "A game is already in progress.";
  }
  processAnswer(message, callback) {
    console.log("Processing Answer: " + message);
    if (this.isAnswerCorrect(message)) {
      //   this.nextQuestion()
      console.log("Correct Answer");
      if (this.lastQuestion === this.questionNumber) {
        this.endGame(null, callback);
      } else {
        this.nextQuestion(
          function (error, rowcount) {
            if (!error) {
              this.getQuestionData(
                this.questionNumber,
                function (error) {
                  if (error) {
                    callback(error);
                  } else if (rowcount > 0) {
                    callback(
                      `Well done! ${message} was correct.\n\n ${this.direction}\n\n ${this.questionText}`
                    );
                  }
                }.bind(this)
              );
            }
          }.bind(this)
        );
      }
    } else {
      //TODO: write incorrect answer data to database (answers table)
      console.log("Incorrect Answer");
      this.timesAnsweredIncorrect++;
      callback(null, "Bad luck! Try again");
    }
  }

  skipAnswer(callback) {
    console.log("Question skipped");
    this.nextQuestion(
      function (error, rowcount) {
        if (!error) {
          this.getQuestionData(this.questionNumber, function (error, question) {
            if (error) {
              callback(error);
            } else if (rowcount > 0) {
              callback(
                `Question skipped. You can try this one again later. \n\n ${question}`
              );
            }
          });
        }
      }.bind(this)
    );
  }
  //TODO: Try to incorporate nextQuestionReply instead of anonymous function in process answer and skip answer
  nextQuestionReply(error, rowcount, callback) {
    if (!error) {
      this.getQuestionData(this.questionNumber, function (error, question) {
        if (error) {
          callback(error);
        } else if (rowcount > 0) {
          callback(
            `Question skipped. You can try this one again later. \n\n ${question}`
          );
        }
      });
    }
  }

  getHint(callback) {
    console.log("Getting hint");
    callback("Sorry, hints are not supported yet.");
  }

  getGameRules(callback) {
    db.getRules(
      function (error, rows) {
        //callback with the rows from the db. This propagates back up the calls.
        callback(error, this.buildRuleString(rows));
      }.bind(this)
    );
  }

  buildRuleString(rows) {
    return rows.reduce(function (acc, curr) {
      return (acc += `${curr.ruledesc}\n\n`);
    }, "");
  }

  get phoneNumber() {
    return this._phoneNumber;
  }
  set phoneNumber(phoneNumber) {
    this._phoneNumber = phoneNumber;
  }
  get questionNumber() {
    return this._questionNumber;
  }
  set questionNumber(questionNumber) {
    this._questionNumber = questionNumber;
  }
  get gameStarted() {
    return this._gameStarted;
  }
  set gameStarted(isStarted) {
    this._gameStarted = isStarted;
  }
  get timesAnsweredIncorrect() {
    return this._timesAnsweredIncorrect;
  }
  set timesAnsweredIncorrect(timesAnsweredIncorrect) {
    this._timesAnsweredIncorrect = timesAnsweredIncorrect;
  }
  get listeningMode() {
    return this._listeningMode;
  }
  set listeningMode(listeningMode) {
    this._listeningMode = listeningMode;
  }
  get questionText() {
    return this._questionText;
  }
  set questionText(questionText) {
    this._questionText = questionText;
  }
  get hint() {
    return this._hint
      ? this.hint
      : "This question does not currently have a hint";
    // return this._currentHint
  }
  set hint(hint) {
    this._hint = hint;
  }
  get answer() {
    return this._answer;
  }
  set answer(answer) {
    this._answer = answer;
  }
  get answers() {
    //TODO: Implement logic for this
    return "Placeholder to return previous answers";
  }
};

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
