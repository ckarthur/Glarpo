const express = require('express');
const mongoose = require('mongoose');
const triviaRouter = require("./routes/trivia");
const path = require("path");
require('dotenv').config();

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", triviaRouter);

const portNumber = 5000;

async function start() {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
    app.listen(portNumber);
}

start().catch(e => {
    console.error(e);
    process.exit(1);
});
