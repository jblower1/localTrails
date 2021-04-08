const db = require("../db/localTrailsDb");

const listeningModes = {
  standard: "STANDARD",
  newQuestion: "NEWQUESTION",
};

const statuses = {
  IN_PROGRESS: {value: "IN_PROGRESS", text: "Game is currently in progress. Type Pause to pause game."},
  NOT_STARTED: {value: "NOT_STARTED", text: "Game is currently not started. Type Start."},
  PAUSED: {value: "PAUSED", text: "Game is currently paused. Type Start to resume"},
  COMPLETED: {value: "COMPLETED", text: "Game is completed. Thank you for playing!"}
};

const points = {
  correct: 10,
  incorrect: 2
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
      answerPoints: this.answerPoints,
      penaltyPoints: this.penaltyPoints,
      duration: this.duration,
      status: this.status
    } = properties);
    this.gameStarted = properties.status === statuses.IN_PROGRESS.value;
    this.listeningMode = listeningModes.standard;
    //log time started
     //THIS IS STARTED TOO EARLY. NEEDS TO BE SET IF GAME IS IN_PRGRESS. OTHERWISE ONLY IF START IS CALLED. 
  }

  welcomeMessage(callback){
    if(this.status === statuses.IN_PROGRESS.value){
      return callback(this.questionText);
    }else if(this.status === statuses.NOT_STARTED.value){
      return this.getGameRules(callback);
    }else if(this.status === statuses.PAUSED.value){
      return callback("Game is paused. Type \"start\" to resume");
    }else if(this.status === statuses.COMPLETED.value){
      return callback("You have already completed your game. Thanks for playing.");
    }
  }
  /**
   * Start the game or resume the game from paused
   * @param {function} callback do the callback 
   */
  startGame(callback) {
    if(!this.isInProgress){
      db.startGame(
        this.gameId,
        function (error, rowCount) {
          if (error) {
            callback(error);
          } else if (rowCount > 0) {
            console.log("Trail started");
            this.sessionStartTime = new Date();
            this.status = statuses.IN_PROGRESS.value;
            this.getQuestionData(this.questionNumber, callback);
          } else if (rowCount === 0) {
            callback("I'm sorry, this game has already been completed.");
          }
        }.bind(this)
      );
    }else{
      callback(this.gameInProgress());
    }
  }
  processAnswer(message, callback) {
    console.log("Processing Answer: " + message);
    if (this.isAnswerCorrect(message)) {
      //   this.nextQuestion()
      console.log("Correct Answer");
      this.answerPoints += points.correct;
      if (this.lastQuestion === this.questionNumber) {
        this.endGame(null, callback);
      } else {
        this.nextQuestion(
          function (error, rowcount) {
            if (!error) {
              this.getQuestionData(
                this.questionNumber,
                function (error, question) {
                  if (error) {
                   callback(error);
                  } else if (rowcount > 0) {
                    callback(null, 
                      `Well done! ${message} was correct.\n\n ${this.direction}\n\n ${question}`
                    );
                  }
                }.bind(this)
              );
            }
          }.bind(this)
        );
      }
    } else {
      console.log("Incorrect Answer");
      this.penaltyPoints += points.incorrect;
      callback(null, "Bad luck! Try again");
    }
  }
  /**
   * Get all necessary question data from DB
   * @param {integer} questionId id of the question
   * @param {function} callback callback function
   */
  getQuestionData(questionId, callback) {
    console.log("About to get question");
    db.getQuestionText(
      questionId,
      function (error, rows) {
        if(error){
          callback(error);
        }else{
          this.extractQuestion(rows);
          callback(null, this.formattedQuestion);
        }
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
    this.sessionEndTime = new Date();
    this.status = statuses.COMPLETED.value;
    this.calculateGameSeconds();
    db.endGame(
      this.gameId,
      this.teamId,
      this.status,
      this.duration,
      this.answerPoints,
      this.penaltyPoints,
      function (error, rowcount) {
        if (error) {
          callback(error);
        } else if (rowcount > 0 && !userInput) {
          callback(null, "Congratulations, you have completed the trail!");
        } else if (rowcount > 0 && userInput) {
          callback(null, "You've ended the game early.Thanks for playing this local trail");
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

  nextQuestion(callback) {
    console.log("Setting next question");
    this.timesAnsweredIncorrect = 0;
    this.questionNumber = this.questionNumber + 1;
    db.setQuestion(this.gameId, this.teamId, this.questionNumber, this.answerPoints, this.penaltyPoints, callback);
  }
  gameInProgress() {
    return "A game is already in progress.";
  }

  pauseGame(callback){
      this.sessionEndTime = new Date();
      this.status = statuses.PAUSED.value;
      this.calculateGameSeconds();
      db.endGame(
        this.gameId,
        this.teamId,
        this.status,
        this.duration,
        this.answerPoints,
        this.penaltyPoints,
        function (error, rowcount) {
          if (error) {
            callback(error);
          } else if (rowcount > 0) {
            callback("Game Paused. The game time has stopped until you interact with this chat again.");
          }
        }
      );
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

  sessionDurationSeconds(){
    //only calculate if there is a start time (If there isn't the game is in memory but paused/finished 
    //and won't have a start time for this session)
    let ms = this.sessionStartTime ? this.sessionEndTime.getTime() - this.sessionStartTime.getTime() : 0;
    return Math.round(ms/1000);
  }

  calculateGameSeconds(){
    this.duration += this.sessionDurationSeconds();
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
  get answerPoints(){
    return this._answerPoints;
  }
  set answerPoints(points){
    this._answerPoints = points;
  }
  addAnswerPoints(points){
    this.answerPoints = this.answerPoints() + points;
  }
  get penaltyPoints(){
    return this._penaltyPoints;
  }
  set penaltyPoints(points){
    this._penaltyPoints = points;
  }
  addpenaltyPoints(points){
    this.penaltyPoints = this.penaltyPoints() + points;
  }
  get sessionStartTime(){
    return this._sessionStartTime;
  }
  set sessionStartTime(date){
    this._sessionStartTime = date;
  }
  get sessionEndTime(){
    return this._sessionEndTime;
  }
  set sessionEndTime(date){
    this._sessionEndTime = date;
  }
  get status(){
    return this._status;    
  }
  set status(status){
    this._status = status;
  }

  get statusText(){
    return Object.entries(statuses).find(status => status[1].value === this.status)[1].text;
  }

  get isPaused(){
    return this.status === statuses.PAUSED.value;
  }
  get isInProgress(){
    return this.status === statuses.IN_PROGRESS.value;
  }
  get isCompleted(){
    return this.status === statuses.COMPLETED.value;
  }
  get formattedQuestion(){
    return `Question ${this.questionNumber}/${this.lastQuestion}: ${this.questionText}`;
  }
};
