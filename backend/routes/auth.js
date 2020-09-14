const {User} = require('../models/users');
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/token', async (req, res) => {
    if(req.body.username === undefined || req.body.password === undefined) res.status(400).send({Error : "username or password is missing" })
    if(req.body.username == '' || req.body.username.length < 3) return res.status(400).send({Error : "username is invalid or having chars less than 3" })
    if(req.body.password == '' || req.body.password.length < 3) return res.status(400).send({Error : "password is invalid or having chars less than 3" })
    let user = await User.findOne({username : req.body.username})
    if(!user) return res.status(400).send('user name or password is invalid');
    let isVlalidUser = await bcrypt.compare(req.body.password,user.password);
    if(!isVlalidUser) return res.status(400).send('invalid user name or password');
    else{ 
        res.send(user.generateAuthToken());
    }
});

module.exports = router