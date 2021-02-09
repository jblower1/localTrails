require('dotenv').config()
const express = require("express")
const bodyParser  = require("body-parser")
const questionRouter = require("./questionRouter")
const MessagingResponse = require("twilio").twiml.MessagingResponse

var app = express()
app.use(bodyParser.urlencoded({extended: true}))

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken);

//GET path used in localhost to serve an html with a text box to enter text to check response
app.get("/test", function(req, res){
  res.sendFile(__dirname + "/test.html")
})

//POST to interpret user messages
app.post("/incoming", function(req, res){
  console.log(req.body)
  const twiml = new MessagingResponse()
  // var responseMessage =
  questionRouter.routeUserMessage(req.body, function(responseMessage){
    twiml.message(responseMessage)
    res.writeHead(200, {"Content-Type": "text/xml"})
    res.end(twiml.toString())

  })
})

var port = process.env.PORT //? process.env.PORT : 3000

app.listen(port, function(){
  console.log("Server is running on port " + port)
})




// console.log("Test message being sent...")
function testMessage(){
  client.messages
        .create({
           body: 'Test Message from Node',
           from: 'whatsapp:+14155238886',
           to: 'whatsapp:+447931312860'
         })
        .then(message => console.log(message.sid))
        .done();
}
