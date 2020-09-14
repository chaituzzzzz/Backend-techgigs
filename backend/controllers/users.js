const mongoose = require("mongoose");
const {User : Users } = require("../models/users");
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorresponse');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const config = require('config');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(config.get('salt'));



module.exports.updateGuest = asyncHandler(async (req, res, next) => {
    const user = await Users.findById(req.user._id);
    if(!user) return next(new ErrorResponse("User not found", 404))
    let username = req.body.username ? {username :req.body.username }: {};
    let email = req.body.email ? {email :req.body.email } : {};
    let razorpayappId = req.body.razorpayappId ? {razorpayappId :req.body.razorpayappId }: {};
    let razorpayappsecretKey = req.body.razorpayappsecretKey ? {razorpayappsecretKey :req.body.razorpayappsecretKey }: {};
    if(req.body.api_key){
        api_key = {api_key : cryptr.encrypt(req.body.api_key)};  }
    else {
        api_key = {}
    };
    if(req.body.api_secret){
        api_secret = {api_secret :cryptr.encrypt(req.body.api_secret)};  }
    else {
        api_secret = {}
    }

    let newUser = await Users.findByIdAndUpdate(req.user._id, {
        ...username,
        ...email,
        ...razorpayappId,
        ...razorpayappsecretKey,
        ...api_key,
        ...api_secret
    }, {
        new: true,
        runValidators: true
      });
    const model = {
        username : null,
        email : null,
        razorpayappId : null,
        razorpayappsecretKey : null,
        isAdmin : null  
    }
    res.json(_.pick(newUser, _.keys(model)))
}); 