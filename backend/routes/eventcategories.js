const express = require("express");
const mongoose = require("mongoose");
var multer  = require('multer');
const EventCategories = require("../models/eventcategories");
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const app = express();
const router = express.Router();
const eventCategoriesController = require('../controllers/eventcategories');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './categoriesimages')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + '.jpg')
    }
})
var upload = multer({ storage: storage });


//routes
router.route('/').get(eventCategoriesController.getEventCategories)
                 .post(upload.single('category'),eventCategoriesController.addEventCategory)

router.route('/:id').delete(eventCategoriesController.deleteEventCategory)

module.exports = router;