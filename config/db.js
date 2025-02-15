const mongoose = require('mongoose');
const env = require('dotenv').config();

// for offline database 
mongoose.connect('mongodb://127.0.0.1:27017/schoolMgmt');

// for online Database 
// mongoose.connect(process.env.MONGODB_CONNECT_URI);

const db = mongoose.connection;

db.once('open',err=>console.log(err?err:"Db Connected"));

module.exports = db;