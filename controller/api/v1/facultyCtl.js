const Faculty = require('../../../models/FacultyModel');
const Course = require('../../../models/CourseModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('dotenv').config();
const sendMailer = require('../../../services/sendMailer');
const passwodManage = require('../../../services/passwodManage');

module.exports.facultyLogin = async (req,res)=>{
    try {
        const isExistFaculty = await Faculty.findOne({email:req.body.email});
        if(!isExistFaculty){
            return res.status(403).json({message:"Invalid Email"});
        }

        if(await bcrypt.compare(req.body.password,isExistFaculty.password)){
            const facultyToken = await jwt.sign({facultyData:{id:isExistFaculty._id}},process.env.JWT_SECRET_KEY,{expiresIn:'1d'});
            return res.status(200).json({message:"Faculty Login Successfully",token:facultyToken});
        }else{
            return res.status(403).json({msg:"Invalid Password"});
        }

    } catch (err) {
        return res.status(400).json({msg:"Something Wrong",errors:err})   
    }
};

module.exports.facultyProfile = async(req,res)=>{
    try {
        return res.status(200).json({msg:"Faculty Profile",data:req.user});
    } catch (err) {
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

module.exports.editFacultyProfile = async(req,res)=>{
    try {
        const isExistFaculty = await Faculty.findById(req.params.id);
        if(!isExistFaculty){
            return res.status(400).json({msg:"Faculty not Found"});
        }

        const prevFaculty = await Faculty.findByIdAndUpdate(req.params.id,req.body);
        if(prevFaculty){
            const updatedFaculty = await Faculty.findById(prevFaculty._id);
            return res.status(200).json({msg:"Faculty Profile Update Successfully",data:{prevFaculty,updatedFaculty}})
        }else{
            return res.status(400).json({msg:"Failed to update Faculty Profile"})
        }

    } catch (err) {
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

module.exports.changeFacultyPassword = async(req,res)=>{
    try {
        const {oldPassword,newPassword,confirmPassword} = req.body;
        const result = await passwodManage.changePassword('faculty',req.user._id,oldPassword,newPassword,confirmPassword);

        if(result){
            return res.status(result.statusCode).json({msg:result.msg});
        }else{
            return res.status(400).json({msg:"Failed to Change Password"});
        }

    } catch (err) {
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

module.exports.facultyLogOut  = async(req,res)=>{
    try {
        req.session.destroy((err)=>{
            if(err){
                return res.status(400).json({msg:"Something Wrong",errors:err});
            }
            return res.status(200).json({msg:"Go To Login"});
        })
    } catch (err) {
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

module.exports.checkEmail = async (req,res)=>{
    try {
        const result = await passwodManage.sendOtpMail('faculty',req.body.email);
        if(result){
            return res.status(200).json({msg:'OTP Send in Mail',email:result.email,otp:result.otp});
        }else{
            return res.status(400).json({msg:'Mail not send'});    
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

module.exports.forgetPassword = async(req,res)=>{
    try {
        const result = await passwodManage.forgetPassword('faculty',req.params.email,req.body.newPassword,req.body.confirmPassword);
        if(result){
            return res.status(result.statusCode).json({msg:result.msg});
        }else{
            return res.status(400).json({msg:'Failed to Forget Password'});    
        }
        
    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

// add course /
module.exports.addCourse = async(req,res)=>{
    try {
        req.body.facultyId = req.user._id;
        req.body.adminId = req.user.adminId;
        const addedCourse = await Course.create(req.body);
        if(addedCourse){
            const singleFaculty = await Faculty.findById(addedCourse.facultyId);
            singleFaculty.courseIds.push(addedCourse._id);
            await Faculty.findByIdAndUpdate(singleFaculty._id,singleFaculty);

            return res.status(200).json({msg:"Course Added",data:addedCourse});
        }else{
            return res.status(400).json({msg:"Failed to add Course"});
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
}