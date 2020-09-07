const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");

const app = express();

//BodyParser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Database config
const db = require("./config/keys").mongoURI;
mongoose.connect(db, {useNewUrlParser: true})
        .then(() => console.log("MongoDB successfuly connected"))
        .catch(err => console.log(err));

//passport middleware
app.use(passport.initialize());

//passport config
require("./config/passport") (passport);

//routes
app.use("/api/users", users);

//Running server
const port = 5000;
app.listen(port, () => {console.log(`Server running on port ${port}`)});