const {User, validate} = require('../models/users');
const mongoose = require('mongoose');
const _ = require('lodash')
const express = require('express');
const bcrypt = require('bcrypt');
const auth = require('../middlewares/auth');
const guestController = require('../controllers/users');
const router = express.Router();
const config = require('config');



router.get('/getCurrentuser',[auth], async (req,res) =>{
    const currentUser = await User.findById(req.user._id).select('-password');
    return res.json(currentUser);
})



//Registers a guest
router.post('/register', async (req, res) => {
    const { error } = validate(_.pick(req.body,['username','password','email']));
    if (error) return res.status(400).send(error.details[0].message)
    let user = await User.find({username : req.body.username})
    if(user.length > 0) return res.status(400).send('user already exists')
    let razorpayappId = req.body.razorpayappId ? {razorpayappId : req.body.razorpayappId} : {}
    let razorpayappsecretKey = req.body.razorpayappsecretKey ? { razorpayappsecretKey : req.body.razorpayappsecretKey} : {}
    user = new User({
        username : req.body.username,
        password : req.body.password,
        email : req.body.email,
        ...razorpayappId,
        ...razorpayappsecretKey
    }) 
    user.password = await bcrypt.hash(user.password,config.get('salt'));
    user = await user.save()
    const token = user.generateAuthToken();

    
    res.header('x-auth-token',token).send(_.pick(user,['_id','username','email']))
});


router.route('/updateguest').put(auth,guestController.updateGuest)


//Registers an admin
router.post('/registerAdmin', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message)
    let user = await User.find({username : req.body.username})
    if(user.length > 0) return res.status(400).send('user already exists')
    user = new User({
        username : req.body.username,
        password : req.body.password,
        email : req.body.email,
        isAdmin : true
    }) 
    const salt = await bcrypt.genSalt(14); 
    user.password = await bcrypt.hash(user.password,salt);
    user = await user.save();
    const token = user.generateAuthToken();
    res.header('x-auth-token',token).send(_.pick(user,['_id','username','email']))
});


module.exports = router