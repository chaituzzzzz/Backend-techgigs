const mongoose = require('mongoose');
const express = require('express');
const config = require('config');
const helmet = require('helmet');
const conmpression = require('compression');
const users= require('./routes/users');
const auth = require('./routes/auth');
const categories = require('./routes/eventcategories');
const events = require('./routes/events');
const errorHandler = require('./middlewares/errorhandler');
const cors = require('cors');
const app = express();
mongoose.connect(config.get('mongodburl'))
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error(err));

if(!config.get('jwtprivatekey')){
  console.log('jwt private key is not defined or undefined');
  process.exit(1);
}

app.use(cors());
app.use(helmet());
app.use(conmpression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/eventimages'));
app.use(express.static(__dirname + '/categoriesimages'));
app.use('/api/users',users);
app.use('/api/auth',auth);
app.use('/api/categories',categories);
app.use('/api/events',events);
app.use(errorHandler);

  
const port = process.env.PORT || 500;
app.listen(port, () => console.log(`Listening on port ${port}...`));