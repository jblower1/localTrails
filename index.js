const express = require("express")
const bodyParser  = require("body-parser")

var app = express()
app.use(bodyParser.urlencoded({extended: true}))

const accountSid = 'AC8a0bd93cdca1316294f79f8b8036224f';
const authToken = '66715008ea412f8b9ed90f1ad584f7d2';
const client = require('twilio')(accountSid, authToken);


// console.log("Test message being sent...")
// client.messages
//       .create({
//          body: 'Test Message from Node',
//          from: 'whatsapp:+14155238886',
//          to: 'whatsapp:+447931312860'
//        })
//       .then(message => console.log(message.sid))
//       .done();


app.post("/incoming", function(req, res){
  console.log(req.body)
})

app.listen(process.env.PORT, function(){
  console.log("Server is running on port " + process.env.PORT)
})
