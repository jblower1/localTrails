# localTrails
Local Trails Chat Bot

Node.js whatsapp chatbot to handle starting of new local trails, askign questions, checking answers and guiding the player through the questions in the correct order.

Multiple consecutive games required to be possible. 

## Deploy New Blank Database
If the database needs to be redeployed, the following command rebuilds the tables and foreign key dependencies.
```
heroku pg:psql -f db/createDatabase.sql
```

## Deploy App to Heroku
```
git push heroku master
```

## Game Rules
### Scoring
Each game has a number of points attributed to it. Each question can provide a number of points and each incorrect answer will reduce the points received from the total number of points.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
