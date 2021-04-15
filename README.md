# localTrails
Local Trails Whatsapp Chat Bot

Node.js whatsapp chatbot to handle starting of new local trails, asking questions, checking answers and guiding the player through the questions in the correct order.

Multiple consecutive games required to be possible. 

## Running
```bash
npm install
node index.js
```

## Manual Testing
Individual messages can be sent to the application by navigating to `localhost:3000/test`. Enter the text and the response is returned as the XML that would be sent back to Twilio.

## Deploy New Blank Database
If the database needs to be redeployed, the following command rebuilds the tables and foreign key dependencies.
```
heroku pg:psql -f db/createDatabase.sql
```

## Deploy App to Heroku
```
git push heroku master
```
