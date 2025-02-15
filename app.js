const express = require('express');
const env = require('dotenv').config();
const db = require('./config/db');
const app = express();
const passport = require('passport');
const jwtStrategy = require('./config/passpost_jwt_strategy');
const session = require('express-session');

app.use(express.urlencoded());

app.use(session({
    name:'Admin',
    secret:'adminSecret',
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:60*60*1000,
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api',require('./routes/api/v1/adminRoutes'));
app.use('/api/faculty',require('./routes/api/v1/facultyRoutes'));


app.listen(process.env.PORT,err=>console.log(err?err:"Server run on http://localhost:"+process.env.PORT));