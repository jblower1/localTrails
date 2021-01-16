const express = require("express")
const bodyParser  = require("body-parser")
const questionRouter = require("./questionRouter")
const twilioDetails = require("./twilioCreds")
const MessagingResponse = require("twilio").twiml.MessagingResponse

var app = express()
app.use(bodyParser.urlencoded({extended: true}))

const accountSid = twilioDetails.accountSid
const authToken = twilioDetails.authToken
const client = require('twilio')(accountSid, authToken);


// console.log("Test message being sent...")
var testMessage = function(){
  client.messages
        .create({
           body: 'Test Message from Node',
           from: 'whatsapp:+14155238886',
           to: 'whatsapp:+447931312860'
         })
        .then(message => console.log(message.sid))
        .done();
}


app.get("/", function(req, res){
  res.sendFile(__dirname + "/test.html")
})

app.post("/incoming", function(req, res){
  console.log(req.body)
  const twiml = new MessagingResponse()

  var responseMessage = questionRouter.routeUserMessage(req.body)

  twiml.message(responseMessage)
  res.writeHead(200, {"Content-Type": "text/xml"})
  res.end(twiml.toString())

  // testMessage()
})

var port = process.env.PORT ? process.env.PORT : 3000

app.listen(port, function(){
  console.log("Server is running on port " + port)
})
