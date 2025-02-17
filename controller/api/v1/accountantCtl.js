const Accountant = require("../../../models/AccountantModel");
const bcrypt =  require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('dotenv').config();
const sendMailer = require('../../../services/sendMailer');
const { validationResult } = require("express-validator");
const Student = require("../../../models/StudentModel");
const common = require('../../../services/common');

function passwordGanreter(){
    const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    let pass = '';
    for(let i =0 ;i<8;i++){
        pass += str.charAt(Math.floor(Math.random()*str.length)+1);
    };

    return pass;
}

module.exports.accountantLogin = async(req,res)=>{
    try {
        const isExistAccountant = await Accountant.findOne({email:req.body.email});
        if(!isExistAccountant){
            return res.status(403).json({msg:"Invalid Email"});
        }

        if(await bcrypt.compare(req.body.password,isExistAccountant.password)){
            const token = jwt.sign({accountantData:{id:isExistAccountant._id}},process.env.JWT_SECRET_KEY,{expiresIn:'1d'});
            return res.status(200).json({msg:"Accountant Login Successfully",accountToken:token});
        }else{
            return res.status(403).json({msg:"Invalid Password"});
        }

    } catch (err) {
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

module.exports.accountantProfile = async(req,res)=>{
    try {
        return res.status(200).json({msg:"Accountant information",data:req.user});
    } catch (err) {
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

module.exports.editAccountantProfile = async(req,res)=>{
    try {
        const isExistAccountant = await Accountant.findById(req.params.id);
        if(!isExistAccountant){
            return res.status(404).json({msg:"Account not Exist"});
        }

        const prevAccountant = await Accountant.findByIdAndUpdate(req.params.id,req.body);
        if(prevAccountant){
            const newAccountant = await Accountant.findById(prevAccountant._id);
            return res.status(200).json({msg:"Accountant Detail Updated",data:{prevAccountant,newAccountant}})
        }else{
            return res.status(400).json({msg:"Faild to Update"});
        }

    } catch (err) {
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

module.exports.changeAccPassword = async(req,res)=>{
    try {
        const isExistAccountant = await Accountant.findById(req.params.id);
        if(!isExistAccountant){
            return res.status(404).json({msg:'Accountant not Exist'}); 
        }

        if(!await bcrypt.compare(req.body.oldPassword,isExistAccountant.password)){
            return res.status(403).json({msg:"Old Password Not Match"});
        }

        if(req.body.oldPassword == req.body.newPassword){
            return res.status(403).json({msg:"Old and New Password are same Please try onthor"});
        }

        if(req.body.newPassword == req.body.confirmPassword){
            const newPass = await bcrypt.hash(req.body.newPassword,10);
            const updatePass = await Accountant.findByIdAndUpdate(isExistAccountant._id,{password:newPass});
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

module.exports.accountantLogout = async(req,res)=>{
    try {
        req.session.destroy((err)=>{
            if(err){
                return res.status(400).json({msg:"Something Wrong"})
            }
            return res.status(200).json({msg:"You are Logout, Go To Login"})
        })
    } catch (err) {
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

module.exports.sendOtp = async(req,res)=>{
    try {
        const isExistAccountant = await Accountant.findOne({email:req.body.email});
        if(isExistAccountant){
            let OTP;
            do {
                OTP = Math.floor(Math.random()*10000)
            } while (OTP.toString().length != 4);

            const sub = "Veryfication Otp";
            const content =  `<p>Your OTP for forget password is <b>${OTP}</b></p>`;

            const info =await sendMailer(isExistAccountant.email,sub,content);
            if(info){
                return res.status(200).json({msg:"Check your Email, Otp send in your Email",email:isExistAccountant.email,OTP});
            }else{
                return res.status(400).json({msg:"email not send"});
            }

        }else{
            return res.status(404).json({msg:"Faculty not Exist with this Email"});
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

module.exports.forgetPassword = async(req,res)=>{
    try {
        const isExistAccountant = await Accountant.findOne({email:req.params.email});
        if(!isExistAccountant){
            return res.status(404).json({msg:'Faculty Not Faound'});
        }

        if(req.body.newPassword == req.body.confirmPassword){
            const newPass = await bcrypt.hash(req.body.newPassword,10);
            const updatePass = await Accountant.findByIdAndUpdate(isExistAccountant._id,{password:newPass});
            if(updatePass){
                return res.status(200).json({msg:"Password Forgeted, Go to Login"})
            }else{
                return res.status(400).json({msg:"Failed to Forget Password"});
            }
        }else{
            return res.status(400).json({msg:"New and Confirm Password are Not Match"});
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};


// add students 
module.exports.addStudent = async(req,res)=>{
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(403).json({msg:"Invalid Credentials",errors:errors.mapped()});
        }

        const pass = passwordGanreter()
        req.body.password = await bcrypt.hash(pass,10);
        req.body.accountantId = req.user._id;
        req.body.adminId = req.user.adminId;

        const addedStudent = await Student.create(req.body);
        if(addedStudent){
            // add faculty id to admin 
            const singleAccountant = await Accountant.findById(addedStudent.accountantId);
            singleAccountant.studentIds.push(addedStudent._id);
            await Accountant.findByIdAndUpdate(singleAccountant._id,singleAccountant);

            const sub = 'Login Information';
            const content = `
                <h1>Your Login Information</h1>
                <p>Email : ${addedStudent.email}</p>
                <p>Email : ${pass}</p>
                <p>Login Link : ${req.body.studentLoginLink} </p>
            `
            const info = await sendMailer(addedStudent.email,sub,content);
            if(info){
                return res.status(200).json({msg:"Check Your Email For Login"});
            }else{
                return res.status(400).json({msg:"Failed to Send Email"});
            }

        }else{
            return res.status(400).json({msg:'Faculty not added'});
        }

    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

module.exports.viewStudent  = async(req,res)=>{
    try {
        const allStudent = await Student.find({accountantId:req.user._id});
        if(allStudent){
            return res.status(200).json({msg:"Student Data",data:allStudent});
        }else{
            return res.status(404).json({msg:"Student Data not Found",errors:err});
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
}

module.exports.changeStudentStatus = async(req,res)=>{
    try {
        const result = await common.chnageStatus(req.body.id,JSON.parse(req.body.status),"Student");
        return res.status(result.statusCode).json({msg:result.msg});
    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
};


module.exports.deleteStudent = async(req,res)=>{
    try {
        const result = await common.deletData(req.params.id,'Student');
        return res.status(result.statusCode).json({msg:result.msg});
    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
}