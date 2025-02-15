const Student = require('../../../models/StudentModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('dotenv').config();
const sendMailer = require('../../../services/sendMailer');


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
        const isExistStudent = await Student.findById(req.params.id);
        if(!isExistStudent){
            return res.status(404).json({msg:'Faculty not Exist'}); 
        }

        if(!await bcrypt.compare(req.body.oldPassword,isExistStudent.password)){
            return res.status(403).json({msg:"Old Password Not Match"});
        }

        if(req.body.oldPassword == req.body.newPassword){
            return res.status(403).json({msg:"Old and New Password are same Please try onthor"});
        }

        if(req.body.newPassword == req.body.confirmPassword){
            const newPass = await bcrypt.hash(req.body.newPassword,10);
            const updatePass = await Student.findByIdAndUpdate(isExistStudent._id,{password:newPass});
            if(updatePass){
                return res.status(200).json({msg:"Your Password Change Successfully, For Continue Login Againg"});
            }else{
                return res.status(400).json({msg:"Failed To Change Password"});
            }
        }else{
            return res.status(403).json({msg:"New and Confirm Password are not Match"});
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
        const isExistStudent = await Student.findOne({email:req.body.email});
        if(isExistStudent){
            let OTP;
            do {
                OTP = Math.floor(Math.random()*10000)
            } while (OTP.toString().length != 4);

            const sub = "Veryfication Otp";
            const content =  `<p>Your OTP for forget password is <b>${OTP}</b></p>`;

            const info =await sendMailer(isExistStudent.email,sub,content);
            if(info){
                return res.status(200).json({msg:"Check your Email, Otp send in your Email",email:isExistStudent.email,OTP});
            }else{
                return res.status(400).json({msg:"email not send"});
            }

        }else{
            return res.status(404).json({msg:"Invalid Email"});
        }
    } catch (err) {
        return res.status(400).json({msg:"Somethin Wrong",errors:err});
    }
};

module.exports.forgetPassword = async(req,res)=>{
    try {
        const isExistStudent = await Student.findOne({email:req.params.email});
        if(!isExistStudent){
            return res.status(404).json({msg:'Faculty Not Faound'});
        }

        if(req.body.newPassword == req.body.confirmPassword){
            const newPass = await bcrypt.hash(req.body.newPassword,10);
            const updatePass = await Student.findByIdAndUpdate(isExistStudent._id,{password:newPass});
            if(updatePass){
                return res.status(200).json({msg:"Password Forgeted, Go to Login"})
            }else{
                return res.status(400).json({msg:"Failed to Forget Password"});
            }
        }else{
            return res.status(400).json({msg:"New and Confirm Password are Not Match"});
        }
    } catch (err) {
        return res.status(400).json({msg:"Somethin Wrong",errors:err});
    }
}