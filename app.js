const express = require('express');
const env = require('dotenv').config();
const db = require('./config/db');
const app = express();

app.use(express.urlencoded());

app.use('/api',require('./routes/api/v1/adminRoutes'));


app.listen(process.env.PORT,err=>console.log(err?err:"Server run on http://localhost:"+process.env.PORT));