const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types
const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description :  {
        type:String,
        required:true
    },
    imagePath : {
        type : String,
        required : true
    }
},{timestamps:true})

const Category = mongoose.model("category",categorySchema);

module.exports = Category;