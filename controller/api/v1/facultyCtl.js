const Faculty = require('../../../models/FacultyModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('dotenv').config();
const sendMailer = require('../../../services/sendMailer');

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
        const isExistFaculty = await Faculty.findById(req.user._id);
        if(!isExistFaculty){
            return res.status(404).json({msg:'Faculty not Exist'}); 
        }

        if(!await bcrypt.compare(req.body.oldPassword,isExistFaculty.password)){
            return res.status(403).json({msg:"Old Password Not Match"});
        }

        if(req.body.oldPassword == req.body.newPassword){
            return res.status(403).json({msg:"Old and New Password are same Please try onthor"});
        }

        if(req.body.newPassword == req.body.confirmPassword){
            const newPass = await bcrypt.hash(req.body.newPassword,10);
            const updatePass = await Faculty.findByIdAndUpdate(isExistFaculty._id,{password:newPass});
            if(updatePass){
                return res.status(200).json({msg:"Your Password Change Successfully, For Continue Login Againg"});
            }else{
                return res.status(400).json({msg:"Failed To Change Password"});
            }
        }else{
            return res.status(403).json({msg:"New and Confirm Password are not Match"});
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
        const isExistFaculty = await Faculty.findOne({email:req.body.email});
        if(isExistFaculty){
            let OTP;
            do {
                OTP = Math.floor(Math.random()*10000)
            } while (OTP.toString().length != 4);

            const sub = "Veryfication Otp";
            const content =  `<p>Your OTP for forget password is <b>${OTP}</b></p>`;

            const info =await sendMailer(isExistFaculty.email,sub,content);
            if(info){
                return res.status(200).json({msg:"Check your Email, Otp send in your Email",email:isExistFaculty.email,OTP});
            }else{
                return res.status(400).json({msg:"email not send"});
            }

        }else{
            return res.status(404).json({msg:"Faculty not Exist with this Email"});
        }
    } catch (err) {
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

module.exports.forgetPassword = async(req,res)=>{
    try {
        const isExistFaculty = await Faculty.findOne({email:req.params.email});
        if(!isExistFaculty){
            return res.status(404).json({msg:'Faculty Not Faound'});
        }

        if(req.body.newPassword == req.body.confirmPassword){
            const newPass = await bcrypt.hash(req.body.newPassword,10);
            const updatePass = await Faculty.findByIdAndUpdate(isExistFaculty._id,{password:newPass});
            if(updatePass){
                return res.status(200).json({msg:"Password Forgeted, Go to Login"})
            }else{
                return res.status(400).json({msg:"Failed to Forget Password"});
            }
        }else{
            return res.status(400).json({msg:"New and Confirm Password are Not Match"});
        }

    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
}