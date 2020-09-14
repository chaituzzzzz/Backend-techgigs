const express = require("express");
const mongoose = require("mongoose");
var multer  = require('multer');
const Event = require("../models/events");
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const app = express();
const router = express.Router();
const eventController = require('../controllers/eventcontroller');
const asyncHandler = require("../middlewares/async");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './eventimages')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + '.jpg')
    }
})
var upload = multer({ storage: storage });


//routes
router.route('/').get(eventController.getEvents)
                 .post(auth,upload.single('event'),eventController.addEvent)
router.route('/:id').put(auth,eventController.updateEvent)
                    .delete(auth,eventController.deleteEvent)
                    .get(eventController.getEventById)
router.route('/startEvent/:id').post(auth,eventController.startEvent);
router.route('/completeEvent/:id').post(auth,eventController.completeEvent);
router.route("/payment/order").post(auth,eventController.createOrder);
router.route("/payment/verify").post(auth,eventController.verifyPaymentAndSubscribeToEvent);
router.route("/getevents/myevents").get(auth,eventController.getMyEvents);
router.route("/getevents/myregisteredevents").get(auth,eventController.getMyRegisteredEvents);

module.exports = router;
