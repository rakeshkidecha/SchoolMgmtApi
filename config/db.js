const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/schoolMgmt');

const db = mongoose.connection;

db.once('open',err=>console.log(err?err:"Db Connected"));

module.exports = db;