var assert = require('assert');
var game = require('../game')

describe('Game Tests', function(){
    describe('#extractQuestion()', function(){
        var newGame = new game.Game('0123456789')
        var rows = []
        rows.push({
            questiontext: "Question 1",
            answer: "Answer 1",
            hint: "Hint 1"
        })
        console.log(rows)
        it('should return question: \"Question 1\"', function(){
            assert.strictEqual(newGame.extractQuestion(rows), "Question 1")
        })
        it('should return answer: \"Answer 1\"', function(){
            assert.strictEqual(newGame.currentAnswer, "Answer 1")
        })
        it('should return hint: \"Hint 1\"', function(){
            assert.strictEqual(newGame.currentHint, "Hint 1")
        })
    })
    describe('#extractQuestion() negative', function(){
        //reset rows
        var newGame = new game.Game('0123456789')
        rows = []
        rows.push({
            questiontext: ""
        })
        console.log(rows)
        it('should return question: No remaining questinos!', function(){
            assert.strictEqual(newGame.extractQuestion(rows), "No remaining questions!")
        })
        it('should return answer: blank"', function(){
            assert.strictEqual(newGame.currentAnswer, "")
        })
        it('should return hint: No hint message', function(){
            assert.strictEqual(newGame.currentHint, "This question does not currently have a hint")
        })
    })
    describe('#startGame()', function(){
        var newGame = new game.Game('0123456789')
        it('should fire callback', function(done){
            newGame.startGame(done)
        })
        it('should set game start to true', function(){
            assert.strictEqual(newGame.gameStarted, true)
        })
        it('should set question to 1', function(){
            assert.strictEqual(newGame.questionNumber, 1)
        })
    })
    describe('#endGame()', function(){
        var newGame = new game.Game('01234567')
        newGame.gameStarted = true
        newGame.questionNumber = 6
        newGame.endGame()
        it('should set gameStarted to false', function(){
            assert.strictEqual(newGame.gameStarted, false)
        })
        it('should set the question to 0', function(){
            assert.strictEqual(newGame.questionNumber, 0)
        })
    })
    describe('#nextQuestion()', function(){
        var newGame = new game.Game('0123123456')
        newGame.questionNumber = 5
        newGame.nextQuestion()
        it('should set question number to 6', function(){
            assert.strictEqual(newGame.questionNumber, 6)
        })
    })
    describe('#buildRuleString()', function(){
        var newGame = new game.Game('1231415')
        rows = []
        rows.push({ruledesc: "Rule 1."})
        rows.push({ruledesc: "Rule 2."})
        rows.push({ruledesc: "Rule 3."})
        it('should concatenate all rules', function(){
            assert.strictEqual(newGame.buildRuleString(rows), "Rule 1.\n\nRule 2.\n\nRule 3.\n\n")
        })
    })
    describe('#getGameRules()', function(){
        var newGame = new game.Game('123554')
        it('should fire callback', function(done){
            newGame.getGameRules(
            // function(error, rules){
            //     if(error) done(error)
            //     else done()
            // }
            done
            )
        })
    })
})