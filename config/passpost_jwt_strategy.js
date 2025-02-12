const passport = require('passport');
const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const env = require('dotenv').config();
const Admin = require('../models/AdminModel');

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET_KEY
};

passport.use(new jwtStrategy(opts,async(payload,done)=>{
    const isExistAdmin = await Admin.findById(payload.adminData.id);
    if(isExistAdmin){
        return done(null,isExistAdmin);
    }else{
        return done(null,false);
    }
}));

passport.serializeUser((user,done)=>{
    return done(null,user._id);
});

passport.deserializeUser(async(id,done)=>{
    const adminData = await Admin.findById(id);
    if(adminData){
        return done(null,adminData);
    }else{
        return done(null,false);
    }
});


module.exports = passport;