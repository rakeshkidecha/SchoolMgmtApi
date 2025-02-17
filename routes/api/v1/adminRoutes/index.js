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

// view faculty 
router.get('/viewFaculty',passport.authenticate('jwt',{failureRedirect:'/api/faliurRedirect'}),adminCtl.viewFaculty);

router.get('/changeFacultyStatus/:id/:status',passport.authenticate('jwt',{failureRedirect:'/api/faliurRedirect'}),adminCtl.changeFacultyStatus);

router.delete('/deleteFaculty/:id',adminCtl.deleteFaculty);


// view Accountant 
router.get('/viewAccountant',passport.authenticate('jwt',{failureRedirect:'/api/faliurRedirect'}),adminCtl.viewAccountant);

router.get('/changeAccountantStatus/:id/:status',passport.authenticate('jwt',{failureRedirect:'/api/faliurRedirect'}),adminCtl.changeAccountantStatus);

router.delete('/deleteAccountant/:id',passport.authenticate('jwt',{failureRedirect:'/api/faliurRedirect'}),adminCtl.deleteAccountant);

// view student 
router.get('/viewStudent',passport.authenticate('jwt',{failureRedirect:'/api/faliurRedirect'}),adminCtl.viewStudent);

router.get('/changeStudentStatus/:id/:status',passport.authenticate('jwt',{failureRedirect:'/api/faliurRedirect'}),adminCtl.changeStudentStatus);

router.delete('/deleteStudent/:id',passport.authenticate('jwt',{failureRedirect:'/api/faliurRedirect'}),adminCtl.deleteStudent);


module.exports = router;