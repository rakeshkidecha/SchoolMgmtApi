const Admin = require('../../../models/AdminModel');
const {validationResult} = require('express-validator');
const env = require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports.registerAdmin = async(req,res)=>{
    try {

        const error = validationResult(req);
        if(!error.isEmpty()){
            return res.status(403).json({msg:"Invalid Credentials",error: error.mapped()});
        }
        
        req.body.password = await bcrypt.hash(req.body.password,10);
        const addedAdmin = await Admin.create(req.body);

        if(addedAdmin){
            return res.status(200).json({msg:"Admin Add Successfully",record:addedAdmin});
        }else{
            return res.status(200).json({msg:"Failed to add Admin"});
        }

    } catch (err) {
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

module.exports.adminLogin = async(req,res)=>{
    try {
        let isExistAdmin = await Admin.findOne({email:req.body.email});
        if(!isExistAdmin){
            return res.status(403).json({msg:"Invalid Email"});
        }

        if(await bcrypt.compare(req.body.password,isExistAdmin.password)){
            const adminToken = jwt.sign({adminData:{id:isExistAdmin._id}},process.env.JWT_SECRET_KEY,{expiresIn:60*60*1000});

            return res.json({msg:"Login Successfully",adminToken})
        }else{
            return res.status(403).json({msg:'Invalid Password'});
        }

    } catch (err) {
        console.log(err)
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

module.exports.adminProfile = async(req,res)=>{
    try {
        return res.status(200).json({msg:"Admin Information",data:req.user});
    } catch (err) {
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};

module.exports.editAdminProfile = async(req,res)=>{
    try {
        const isExistAdmin = await Admin.findById(req.params.id);
        if(isExistAdmin){
            const updateAdmin = await Admin.findByIdAndUpdate(req.params.id,req.body);
            if(updateAdmin){
                const newAdminData = await Admin.findById(req.params.id);
                return res.status(200).json({msg:"Admin Profile Updated Successfully",data:{
                    oldDetail:updateAdmin,
                    newDetail:newAdminData
                }});
            }else{
                return res.status(400).json({msg:"Failed to Update Admin Profile"});
            }
        }else{
            return res.status(404).json({msg:"Admin Record not Found"});
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
};

module.exports.chnageAdminPassword= async(req,res)=>{
    try {
        const isExistAdmin = await Admin.findById(req.user._id);
        if(!isExistAdmin){
            return res.status(400).json({msg:"Record Not Found"});
        };

        if(!await bcrypt.compare(req.body.currentPassword,isExistAdmin.password)){
            return res.status(403).json({msg:'Invalid Current Password'});
        };

        if(req.body.currentPassword == req.body.newPassword){
            return res.status(400).json({msg:"Current and New Password are Same, Please Try Anthor One"});
        }

        if(req.body.newPassword == req.body.confirmPassword){
            const newPassword = await bcrypt.hash(req.body.newPassword,10);
            const updateAdminPass = await Admin.findByIdAndUpdate(isExistAdmin._id,{password:newPassword});
            if(updateAdminPass){
                return res.status(200).json({msg:"Password Changed, Please Login for Continue"});
            }else{
                return res.status(400).json({msg:"Failed to Update password"});
            }
        }else{
            return res.status(400).json({msg:"New Password and Confirm Password are not Match"})
        }

    } catch (err) {
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
};

module.exports.adminLogOut = async(req,res)=>{
    try {
        req.session.destroy((err)=>{
            if(err){
                return res.status(400).json({msg:'Something Wrong',errors:err});
            };

            return res.status(200).json({msg:'Go To Login'});
        })
    } catch (err) {
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
}