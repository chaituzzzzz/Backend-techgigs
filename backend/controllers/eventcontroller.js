const mongoose = require("mongoose");
const Event = require("../models/events");
const EventCategory = require('../models/eventcategories');
const {User : Users } = require('../models/users');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorresponse');
const Category = require("../models/eventcategories");
const Events = require("../models/events");
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rp = require('request-promise');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(config.get('salt'));








module.exports.addEvent = asyncHandler(async (req,res, next) => {
    if(!req.body.title || !req.body.description || !req.body.eventDate || !req.body.eventDate || !req.body.categoryId  || !req.body.price ) return next(
        new ErrorResponse(
          `mandatory fields are missing in the request`,
          400
        )
    )

    let eventcategory = await EventCategory.findById(req.body.categoryId);
    if(!eventcategory) return next(
        new ErrorResponse(
          `category with id ${req.body.categoryId} does not exists`,
          404
        )
    )

    let event =  new Event({
        title : req.body.title,
        description : req.body.description,
        eventDate : req.body.eventDate,
        categoryId : req.body.categoryId,
        eventOrganizerId : req.user._id,
        imagePath : req.file.path.split('/')[1],
        price : req.body.price,
        category : eventcategory.name
    }) 

    const savedEvent = await event.save();
    res.json(savedEvent);
   
})


module.exports.getEvents = asyncHandler(async (req,res,next) =>{
    console.log
    const categoryName = req.query.category ? { category: req.query.category } : {};
    const categoryId = req.query.categoryId ? { categoryId: req.query.categoryId } : {}
    const pageNumber = req.query.page ? req.query.page : 1;
    const size = req.query.size ? req.query.size  : 10;
    console.log(pageNumber);
    console.log(size)
    const events = await Event
    .find({...categoryName,...categoryId})
    .sort({subscribersCount: -1})
    res.json(events);
})



module.exports.updateEvent = asyncHandler(async (req, res, next) => {

    //Validations
    const event = await Event.findById(req.params.id);
    if(!event) return next(new ErrorResponse("event not found", 404))

    if(event.eventOrganizerId!=req.user._id) return next(new ErrorResponse("event not belongs to u", 404))

    let _category = await EventCategory.findById(req.body.categoryId);
    if(!_category) return next(new ErrorResponse("category not found", 404))

    //New Updating the category
    let title = req.body.title ? {title :req.body.title }: {};
    let description = req.body.description ? {description :req.body.description } : {};
    let eventDate = req.body.eventDate ? {eventDate :req.body.eventDate }: {};
    let categoryId = req.body.categoryId ? {categoryId :req.body.categoryId }: {};
    let price = req.body.price ? {price :req.body.price }: {};
    let eventStatus = req.body.eventStatus ? {eventStatus :req.body.eventStatus }: {}
    let category = _category.categoryName;
    let newEvent = await Users.findByIdAndUpdate(req.params.id, {
        ...title,
        ...description,
        ...eventDate,
        ...categoryId,
        ...price,
        ...category,
        ...eventStatus
    }, {
        new: true,
        runValidators: true
      });
    res.json(newEvent);
}); 



module.exports.deleteEvent = asyncHandler(async (req,res,next) => {

    const event = await Event.findByIdAndRemove(req.params.id);
    if(!event) return next(new ErrorResponse("event not found", 404))
    if(event.eventOrganizerId!=req.user._id) return next(new ErrorResponse("event not belongs to u", 404))
    res.json({sucess : true})

})


module.exports.getEventById = asyncHandler(async (req,res,next) => {
    let eventId = req.params.id;
    const event = await Event.findById(eventId);
    if(!event) return next(new ErrorResponse("event not found", 404))
    res.json(event)
})



module.exports.createOrder = asyncHandler(async (req,res)=>{
    const eventId = req.query.id;
    const event = await Events.findById(eventId);
    const organizer = await Users.findById(event.eventOrganizerId);
    console.log(organizer);
    var Razorpay=require("razorpay");
    let instance = new Razorpay({
      key_id: organizer.razorpayappId, // organizers `KEY_ID`
      key_secret: organizer.razorpayappsecretKey // organizers `KEY_SECRET`
    })
      params=req.body;
      instance.orders.create(params).then((data) => {
             res.send({"sub":data,key_id : organizer.razorpayappId,"status":"success"});
      }).catch((error) => {
             res.send({"sub":error,"status":"failed"});
      })
})



module.exports.verifyPaymentAndSubscribeToEvent = asyncHandler( async(req,res)=>{
    const eventId = req.query.id;
    const event = await Events.findById(eventId);
    const organizer = await Users.findById(event.eventOrganizerId);
    body=req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
    var crypto = require("crypto");
    var expectedSignature = crypto.createHmac('sha256', organizer.razorpayappsecretKey)
                                    .update(body.toString())
                                    .digest('hex');
                                    console.log("sig"+req.body.razorpay_signature);
                                    console.log("sig"+expectedSignature);
    var response = {"status":"failure"}
    console.log(expectedSignature)
    console.log(req.body.razorpay_signature)
    
    if(expectedSignature === req.body.razorpay_signature){
        response={"status":"success"}
        if(event.subscribers.indexOf(req.user._id) == -1){
            event.subscribers.push(req.user._id);
            event.subscribersCount = event.subscribers.length;
        }
        await event.save();
    }
     //add subscriber to the list
        res.send(response);
    })


    module.exports.getMyEvents = asyncHandler( async(req,res)=>{
            const myEvents = await Events.find({eventOrganizerId : req.user._id});
            res.json(myEvents)
        }  
    )

    module.exports.getMyRegisteredEvents = asyncHandler(async(req,res) => {
            const myRegisteredEvents = await Events.find({subscribers : {$in: req.user._id }})
            res.json(myRegisteredEvents);
    })



    module.exports.startEvent = asyncHandler( async(req,res,next) => {
        const event = await Event.findById(req.params.id);
        if(!event) return next(new ErrorResponse("event not found", 404))
        if(event.eventOrganizerId!=req.user._id) return next(new ErrorResponse("event not belongs to u", 404))
        const userDetails = await Users.findById(req.user._id);
        let api_key = cryptr.decrypt(userDetails.api_key);
        const payload = {
            iss: api_key,    
            exp: ((new Date()).getTime() + 5000)

        };
        
        const token = jwt.sign(payload, cryptr.decrypt(userDetails.api_secret));
        console.log(token);
        var options = {
            method: "GET",
            uri: "https://api.zoom.us/v2/users/me",
            auth: {
                'bearer': token
            },     
            json: true 
        };
        rp(options)
       .then(async function (response) {
               const userId = response.id;
                options = {
                method: "POST",
                uri: "https://api.zoom.us/v2/users/" + userId + "/meetings",
                body:
                {
                        "topic": event.title,
                        "type": "1",
                        "settings": {
                            "approval_type": 0,
                            "join_before_host": true,
                            "mute_upon_entry": true,
                            "participant_video" : true,
                            waiting_room : false
                        }            
                },
                headers: {
                    "User-Agent": "Zoom-api-Jwt-Request",
                    "content-type": "application/json"
                },
                auth: {
                    'bearer': token
                },     
                json: true 
            };
            rp(options)
           .then(async function (response) {
                event.zoomLink = response.join_url;
                event.eventStatus = "In progress";
                await event.save();
                res.send({sucess : true, start_url : response.start_url, join_url : response.join_url});    
            })
            .catch(function (err) {
                 return next(new ErrorResponse(err,500))
            });
            })
        .catch(function (err) {
                 return next(new ErrorResponse(err,500))
        });
    //     res.json(userId);
   

    })


    module.exports.completeEvent = asyncHandler( async(req,res,next) => {
        const event = await Event.findById(req.params.id);
        if(!event) return next(new ErrorResponse("event not found", 404))
        if(event.eventOrganizerId!=req.user._id) return next(new ErrorResponse("event not belongs to u", 404))
        event.eventStatus = "completed";
        await event.save();
        res.json({sucess : true})
    } )



    async function getMyZoomdetails(token){

        
       return details;
    }