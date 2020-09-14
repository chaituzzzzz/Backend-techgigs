const mongoose = require('mongoose');
const { string } = require('joi');
const {ObjectId} = mongoose.Schema.Types
const eventsSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description :  {
        type:String
    },
    price : {
        type : Number,
        required : true
    },
    eventDate : {
        type: Date,
        required : true
    },
    category : {
        type : String,
        required : true
    },
    categoryId : {
        type: mongoose.Schema.ObjectId,
        ref: 'category',
        required: true
    },
    eventOrganizerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },

    eventStatus : {
        type: String,
        default : 'scheduled',
        enum: ['scheduled', 'In progress', 'completed']
    },

    subscribers:[{type:ObjectId,ref:"user", default: []} ],
    
    subscribersCount : {
        type : Number,
        default : 0
    }, 
    zoomLink : {
        type : String
    },

    imagePath : {
        type : String,
        required : true
    }


},{timestamps:true})

const Events = mongoose.model("events",eventsSchema);

module.exports = Events;