# localTrails
Local Trails Chat Bot

Node.js whatsapp chatbot to handle starting of new local trails, askign questions, checking answers and guiding the player through the questions in the correct order.

Multiple consecutive games required to be possible. 

## Deploy New Blank Database
If the database needs to be redeployed, the following command rebuilds the tables and foreign key dependencies.
```sql
heroku pg:psql -f db/createDatabase.sql
```
