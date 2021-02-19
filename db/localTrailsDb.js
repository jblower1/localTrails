const { Client } = require('pg')
const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB,
    password: process.env.DB_USER_PW
})
client.connect()

module.exports.getRules = function(callback){
  console.log("Getting rules from db")
  client.query('SELECT ruledesc FROM rules ORDER BY rule_order ASC', function(err, res){
    if(err){
      console.log(err)
      // client.end()
      return "Sorry, there was a problem reading from the database"
    }else if(res){
      // console.log(res.rows)
      // client.end()
      callback(res.rows)
    }
  })
}

module.exports.getQuestionText = function(questionId, callback){
  console.log("Getting question")
  client.query('SELECT questiontext, answer, hint FROM questions WHERE questionid = $1', [questionId], function(err, res){
    if(err){
      console.log(err)
      // client.end()
      callback("Sorry, there was a problem reading from the database")
    }else if(res){
      // console.log(res.rows)
      // client.end()
      callback(res.rows)
    }
  })
}

// client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
//   console.log(err ? err.stack : res.rows[0].message) // Hello World!
//   client.end()
// })
