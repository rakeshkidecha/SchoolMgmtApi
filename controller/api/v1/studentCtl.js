const Student = require('../../../models/StudentModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('dotenv').config();
const sendMailer = require('../../../services/sendMailer');
const passwodManage = require('../../../services/passwodManage');


module.exports.studentLogin = async (req,res)=>{
    try {
        const isExistStudent = await Student.findOne({email:req.body.email});
        if(!isExistStudent){
            return res.status(403).json({msg:"Invalid Email"});
        }

        if(await bcrypt.compare(req.body.password,isExistStudent.password)){
            const token = await jwt.sign({studentData:{id:isExistStudent._id}},process.env.JWT_SECRET_KEY,{expiresIn:'1h'});
            return res.status(200).json({msg:"Student Login Successfully",studentToken:token});
        }else{
            return res.status(403).json({msg:"Invalid Password"});
        }

    } catch (err) {
        return res.status(400).json({msg:"Somethin Wrong"});
    }
};

module.exports.studentProfile = async(req,res)=>{
    try {
        return res.status(200).json({msg:"Student Information",data:req.user});
    } catch (err) {
        return res.status(400).json({msg:"Somethin Wrong"});
    }
}


module.exports.editStudentProfile = async(req,res)=>{
    try {
        const isExistStudent  = await Student.findById(req.params.id);
        if(!isExistStudent){
            return res.status(403).json({msg:"Student not Exist"});
        }

        const prevStudent = await Student.findByIdAndUpdate(isExistStudent._id,req.body);
        if(prevStudent){
            const newStudent = await Student.findById(prevStudent._id);
            return res.status(200).json({msg:"Student Profile Updated Successfully",data:{prevStudent,newStudent}});
        }else{
            return res.status(400).json({msg:"Failed to update Student"})
        }

    } catch (err) {
        return res.status(400).json({msg:"Somethin Wrong",errors:err});
    }
};


module.exports.changeStudentPassword = async(req,res)=>{
    try {
        const {oldPassword,newPassword,confirmPassword} = req.body;
        const result = await passwodManage.changePassword('student',req.user._id,oldPassword,newPassword,confirmPassword);

        if(result){
            return res.status(result.statusCode).json({msg:result.msg});
        }else{
            return res.status(400).json({msg:"Failed to Change Password"});
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({msg:"Somethin Wrong",errors:err});
    }
};


module.exports.studentLogout = async(req,res)=>{
    try {
        req.session.destroy((err)=>{
            if(err){
                return res.status(400).json({msg:"Somethin Wrong",errors:err});
            }

            return res.status(200).json({msg:"You are Logout, Login Again"})
        })
    } catch (err) {
        return res.status(400).json({msg:"Somethin Wrong",errors:err});
    }
}


// forget password 
module.exports.sendOtp = async(req,res)=>{
    try {
        const result = await passwodManage.sendOtpMail('student',req.body.email);
        if(result){
            return res.status(200).json({msg:'OTP Send in Mail',email:result.email,otp:result.otp});
        }else{
            return res.status(400).json({msg:'Mail not send'});    
        }
    } catch (err) {
        return res.status(400).json({msg:"Somethin Wrong",errors:err});
    }
};

module.exports.forgetPassword = async(req,res)=>{
    try {
        const result = await passwodManage.forgetPassword('student',req.params.email,req.body.newPassword,req.body.confirmPassword);
        if(result){
            return res.status(result.statusCode).json({msg:result.msg});
        }else{
            return res.status(400).json({msg:'Failed to Forget Password'});    
        }
        
    } catch (err) {
        return res.status(400).json({msg:"Somethin Wrong",errors:err});
    }
}