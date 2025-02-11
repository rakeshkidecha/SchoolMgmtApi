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
            isExistAdmin = isExistAdmin.toObject();
            delete isExistAdmin.password;
            const adminToken = jwt.sign({adminData:isExistAdmin},process.env.JWT_SECRET_KEY,{expiresIn:60*60*1000});

            return res.json({msg:"Login Successfully",adminToken})
        }else{
            return res.status(403).json({msg:'Invalid Password'});
        }

    } catch (err) {
        console.log(err)
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
};
