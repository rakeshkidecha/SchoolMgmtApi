const Accountant = require("../models/AccountantModel");
const Admin = require("../models/AdminModel");
const Faculty = require("../models/FacultyModel");
const Student = require("../models/StudentModel");
const sendMailer = require('../services/sendMailer');
const bcrypt = require('bcrypt');

async function changePassword(role,id,oldPass,newPass,conPass){
    let existData;
    if(role=='admin'){
        existData = await Admin.findById(id);
    }else if(role=='faculty'){
        existData = await Faculty.findById(id);
    }else if(role == 'accountant'){
        existData = await Accountant.findById(id);
    }else if(role == 'student'){
        existData = await Student.findById(id);
    }

    if(!await bcrypt.compare(oldPass,existData.password)){
        return {statusCode : 400,msg:'Invalid Current Password'}
    };

    if(oldPass ==newPass){
        return {statusCode : 400,msg:'Current and New Password are Same, Please Try Anthor One'}
    }

    if(newPass== conPass){
        const newPassword = await bcrypt.hash(newPass,10);
        let updatePass;
        if(role=='admin'){
            updatePass =await Admin.findByIdAndUpdate(existData._id,{password:newPassword});
        }else if(role=='faculty'){
            updatePass =await Faculty.findByIdAndUpdate(existData._id,{password:newPassword});
        }else if(role == 'accountant'){
            updatePass =await Accountant.findByIdAndUpdate(existData._id,{password:newPassword});
        }else if(role == 'student'){
            updatePass =await Student.findByIdAndUpdate(existData._id,{password:newPassword});
        }
        if(updatePass){
            return {statusCode : 200,msg:'Password Changed, Please Login for Continue'}
        }else{
            return {statusCode : 400,msg:'Failed to Update password'}
        }
    }else{
        return {statusCode : 400,msg:'New Password and Confirm Password are not Match'}
    }
} 

async function sendOtpMail(role,email) {
    let existData;
    if(role=='admin'){
        existData = await Admin.findOne({email:email});
    }else if(role=='faculty'){
        existData = await Faculty.findOne({email:email});
    }else if(role == 'accountant'){
        existData = await Accountant.findOne({email:email});
    }else if(role == 'student'){
        existData = await Student.findOne({email:email});
    }

    let OTP;
    do {
        OTP = Math.ceil(Math.random()*10000);  
    } while (OTP.toString().length != 4);

    if(existData){
        const sub = "Verification OTP";
        const content =  `<p>Your OTP for forget password is <b>${OTP}</b></p>`;

        const info = await sendMailer(existData.email,sub,content);
        
        return {
            email:existData.email,
            otp:OTP
        }
    }
};

async function forgetPassword(role,email,newPass,conPass) {
    let existData;
    if(role=='admin'){
        existData = await Admin.findOne({email:email});
    }else if(role=='faculty'){
        existData = await Faculty.findOne({email:email});
    }else if(role == 'accountant'){
        existData = await Accountant.findOne({email:email});
    }else if(role == 'student'){
        existData = await Student.findOne({email:email});
    }

    if(newPass== conPass){
        const newPassword = await bcrypt.hash(newPass,10);
        let updatePass;
        if(role=='admin'){
            updatePass =await Admin.findByIdAndUpdate(existData._id,{password:newPassword});
        }else if(role=='faculty'){
            updatePass =await Faculty.findByIdAndUpdate(existData._id,{password:newPassword});
        }else if(role == 'accountant'){
            updatePass =await Accountant.findByIdAndUpdate(existData._id,{password:newPassword});
        }else if(role == 'student'){
            updatePass =await Student.findByIdAndUpdate(existData._id,{password:newPassword});
        }
        if(updatePass){
            return {statusCode : 200,msg:'Set New Password, Please Login for Continue'};
        }else{
            return {statusCode : 400,msg:'Failed to Forget password'};
        }
    }else{
        return {statusCode : 400,msg:'New Password and Confirm Password are not Match'}
    }
}

module.exports = {
    sendOtpMail,
    changePassword,
    forgetPassword
}