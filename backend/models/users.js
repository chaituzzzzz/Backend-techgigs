const Joi = require('joi');
const mongoose = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
    unique:[ true,'username must be unique']
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 500
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 500
  },
  isAdmin: { type: Boolean, default: false },
  razorpayappId : {type :  String},
  razorpayappsecretKey : {type :  String},
  api_key : {type : String},
  api_secret : {type : String}

})

userSchema.methods.generateAuthToken = function(){
  return jwt.sign({_id :this._id, password : this.password, username : this.username, isAdmin : this.isAdmin},config.get('jwtprivatekey'))
}

const User = mongoose.model('user', userSchema);

function validateUser(user) {
  const schema = {
    username: Joi.string().min(3).max(30).required(),
    password : Joi.string().min(3).max(200).required(),
    email : Joi.string().min(3).max(30).required().email()
  };

  return Joi.validate(user, schema);
}

exports.User = User; 
exports.validate = validateUser;