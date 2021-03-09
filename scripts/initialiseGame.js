//INCOMPLETE - CURRENTLY UPLOADING USING CSV FILES NOT THIS

const { Client } = require('pg')
const yargs = require('yargs')

const argv = yargs.option('fname', {
    description: "Player First Name",
    alias: "f",
    type: "string"
}).option('lname', {
    description: "Player Last Name",
    alias: "l",
    type: "string"
}).option('dev', {
    description: "Execute on development DB",
    alias: "d",
    type: "boolean"
}).option('teamname', {
    description: "Name of the team",
    alias:"t", 
    type:"string"
}).option("phone", {
    description: "Whatsapp Number",
    alias: "p",
    type: "string"
}).argv


//connect to correct database
var database = process.env.DB

if(argv.dev){
    console.log("Requested dev DB")
    database = process.env.DB_DEV
}
const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: database,
    password: process.env.DB_USER_PW
})
client.connect()


// extract arguments


//update relevant tables to initialise a game


client.query("INSERT INTO teams(teamname) VALUES($1)", [])
