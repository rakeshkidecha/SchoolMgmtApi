const express = require('express');
const adminCtl = require('../../../controller/api/v1/adminCtl');
const Admin = require('../../../models/AdminModel');
const {check} = require('express-validator');
const router = express.Router();

router.post('/adminRegister',[
    check('username').notEmpty().withMessage('Username is required').isLength({min:2}).withMessage('username must be atleast 2 carectore'),
    check('email').notEmpty().withMessage('email is required').isEmail().withMessage('Invalid Email').custom(async value=>{
        const isExistAdmin = await Admin.findOne({email:value});
        if(isExistAdmin){
            throw new Error('This Email is Already Exist');
        }
    }),
    check('password').notEmpty().withMessage('password is required'),
    check('confirmPassword').notEmpty().withMessage('confirm Password is Required').custom(async (value,{req})=>{
        if(value != req.body.password){
            throw new Error('Password And Confirm password not match');
        }
    })

],adminCtl.registerAdmin);


router.post('/adminLogin',adminCtl.adminLogin);

module.exports = router;