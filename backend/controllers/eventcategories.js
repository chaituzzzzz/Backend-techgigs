const mongoose = require("mongoose");
const EventCategories = require("../models/eventcategories");
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorresponse');




module.exports.getEventCategories = asyncHandler(async (req, res, next) => {
    const categories = await EventCategories.find({});
    res.send(categories);
});


module.exports.addEventCategory = asyncHandler(async (req,res, next) => {
    if(!req.body.name || !req.body.description) return next(
        new ErrorResponse(
          `category name or description is missing`,
          400
        )
    )

    let category =  new EventCategories({
        name : req.body.name,
        description : req.body.description,
        imagePath : req.file.path.split('/')[1]
    }) 

    const savedCategory = await category.save();
    res.json(savedCategory);
   
})

module.exports.deleteEventCategory = asyncHandler(async (req,res, next) => {
        const category = await EventCategories.findById(req.params.id);

        if (!category) {
            return next(
            new ErrorResponse(`category not found with id of ${req.params.id}`, 404)
            );
        }
        category.remove();
        res.status(200).json({ success: true, data: {} });
})