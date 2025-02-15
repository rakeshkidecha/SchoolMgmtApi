const passport = require('passport');
const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const env = require('dotenv').config();
const Admin = require('../models/AdminModel');
const Faculty = require('../models/FacultyModel');
const Accountant = require('../models/AccountantModel');
const Student = require('../models/StudentModel');

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET_KEY
};

// admin login strategy 
passport.use(new jwtStrategy(opts,async(payload,done)=>{
    if(payload.adminData){
        const isExistAdmin = await Admin.findById(payload.adminData.id);
        if(isExistAdmin){
            return done(null,isExistAdmin);
        }else{
            return done(null,false);
        }
    }else{
        return done(null,false);
    }
}));

// faculty login strategy 
passport.use('faculty',new jwtStrategy(opts,async(payload,done)=>{
    if(payload.facultyData){
        const isExistFaculty = await Faculty.findById(payload.facultyData.id);
        if(isExistFaculty){
            return done(null,isExistFaculty);
        }else{
            return done(null,false);
        }
    }else{
        return done(null,false);
    }
}));

// Accountant login strategy 
passport.use('accountant',new jwtStrategy(opts,async(payload,done)=>{
    if(payload.accountantData){
        const isExistAccountant = await Accountant.findById(payload.accountantData.id);
        if(isExistAccountant){
            return done(null,isExistAccountant);
        }else{
            return done(null,false);
        }
    }else{
        return done(null,false);
    }
}));

// Student login strategy 
passport.use('student',new jwtStrategy(opts,async(payload,done)=>{
    if(payload.studentData){
        const isExistStudent = await Student.findById(payload.studentData.id);
        if(isExistStudent){
            return done(null,isExistStudent);
        }else{
            return done(null,false);
        }
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