const { Client } = require('pg')
const dbCredentials = require('./dbCreds')
const client = new Client(dbCredentials)
client.connect()

module.exports.getRules = function(callback){
  console.log("Getting rules from db")
  client.query('SELECT ruledesc FROM rules ORDER BY rule_order ASC', function(err, res){
    if(err){
      console.log(err)
      client.end()
      return "Sorry, there was a problem reading from the database"
    }else if(res){
      // console.log(res.rows)
      client.end()
      callback(res.rows)
    }
  })
}

// client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
//   console.log(err ? err.stack : res.rows[0].message) // Hello World!
//   client.end()
// })
