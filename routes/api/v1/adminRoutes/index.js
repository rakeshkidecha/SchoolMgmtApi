const express = require('express');
const adminCtl = require('../../../../controller/api/v1/adminCtl');
const Admin = require('../../../../models/AdminModel');
const Faculty = require('../../../../models/FacultyModel');
const Accountant = require('../../../../models/AccountantModel');
const {check} = require('express-validator');
const router = express.Router();
const passport = require('passport');

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

router.all('/faliurRedirect',async(req,res)=>{
    try {
        return res.status(403).json({msg:"Invalid Token"});
    } catch (err) {
        return res.status(400).json({msg:'Something Wrong'});
    }
});

router.get('/adminProfile',passport.authenticate('jwt',{failureRedirect:'/api/faliurRedirect'}),adminCtl.adminProfile);

router.put('/editAdminProfile/:id',passport.authenticate('jwt',{failureRedirect:'/api/faliurRedirect'}),adminCtl.editAdminProfile);

router.post('/chnageAdminPassword',passport.authenticate('jwt',{failureRedirect:'/api/faliurRedirect'}),adminCtl.chnageAdminPassword);

router.get('/adminLogOut',passport.authenticate('jwt',{failureRedirect:'/api/faliurRedirect'}),adminCtl.adminLogOut);

// forget password 
router.post('/sendOtp',adminCtl.sendOtp);

router.post('/forgetPassword/:email',adminCtl.forgetPassword);


// add faculty 
router.post('/addFaculty',passport.authenticate('jwt',{failureRedirect:'/api/faliurRedirect'}),[
    check('username').notEmpty().withMessage('Username is required').isLength({min:2}).withMessage('username must be atleast 2 carectore'),
    check('email').notEmpty().withMessage('email is required').isEmail().withMessage('Invalid Email').custom(async value=>{
        const isExistFaculty = await Faculty.findOne({email:value});
        if(isExistFaculty){
            throw new Error('This Email is Already Exist');
        }
    }),
],adminCtl.addFaculty);

// ADD accountant 
router.post('/addAccoutant',passport.authenticate('jwt',{failureRedirect:'/api/faliurRedirect'}),[
    check('username').notEmpty().withMessage('Username is required').isLength({min:2}).withMessage('username must be atleast 2 carectore'),
    check('email').notEmpty().withMessage('email is required').isEmail().withMessage('Invalid Email').custom(async value=>{
        const isExistAccountant = await Accountant.findOne({email:value});
        if(isExistAccountant){
            throw new Error('This Email is Already Exist');
        }
    }),
],adminCtl.addAccoutant);

module.exports = router;