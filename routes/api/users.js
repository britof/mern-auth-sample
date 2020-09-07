const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

//load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//load user data model
const User = require("../../models/user");


//@route POST api/users/register
//@desc Register user
//access Public
router.post("/register", (req, res) => {
    //form validation
    const {errors, isValid} = validateRegisterInput(req.body);

    if(!isValid) {return res.status(400).json(errors);}
    
    User.findOne({username: req.body.username, password: req.body.password})
        .then(user => {if(user) {return res.status(400).json({username: "username already exists"});}
        else {
            const newUser = new User({
                username: req.body.username,
                password: req.body.password
            });

            //Hash password before saving in database
            bcrypt.genSalt(10, (err, salt) => {
                if(err) throw err;
                newUser.save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err));
            });
        }
    });
});

//@route POST api/users/login
//@desc Login user
//@access Public
router.post("/login", (req, res) => {
    //form validation
    const {errors, isValid} = validateLoginInput(req.body);

    if(!isValid) {return res.status(400).json(errors);}

    User.findOne({username: req.body.username})
        .then(user => {
            if(!user) {return res.status(400).json({usernamenotfound: "Username not found"});}

            //check password
            bcrypt.compare(password, user.password).then(isMatch => {
                if(isMatch) {
                    //user matched, create payload
                    const payload = {
                        id: user.id,
                        username: user.username
                    };

                    //sign token
                    jwt.sign(
                        payload,
                        keys.secretOrKey,
                        {expiresIn: 31556926}, //1 year in seconds
                        (err, token) => {
                            res.json({
                                success: true,
                                token: "bearer " + token
                            });
                        }
                    );
                } else {
                    return res.status(400).json({passwordincorrect: "Password incorrect"});
                }
            });

        });
});

module.exports = router;