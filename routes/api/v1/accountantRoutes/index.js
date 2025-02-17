const express = require('express');
const router = express.Router();
const accCtl = require('../../../../controller/api/v1/accountantCtl');
const passport = require('passport');
const Student = require('../../../../models/StudentModel');
const {check}=require('express-validator');

router.post('/accountantLogin',accCtl.accountantLogin);

router.get('/accountantProfile',passport.authenticate('accountant',{failureRedirect:'/api/accountant/unauthAccountant'}),accCtl.accountantProfile);

router.all('/unauthAccountant',async (req,res)=>{
    try {
        return res.status(401).json({msg:"Invalid Accountant Token"});
    } catch (err) {
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
});

router.put('/editAccountantProfile/:id',passport.authenticate('accountant',{failureRedirect:'/api/accountant/unauthAccountant'}),accCtl.editAccountantProfile);

router.post('/changeAccPassword/:id',passport.authenticate('accountant',{failureRedirect:'/api/accountant/unauthAccountant'}),accCtl.changeAccPassword);

router.get('/accountantLogout',passport.authenticate('accountant',{failureRedirect:'/api/accountant/unauthAccountant'}),accCtl.accountantLogout);

// forget password 
router.post('/sendOtp',accCtl.sendOtp);

router.post('/forgetPassword/:email',accCtl.forgetPassword);

//-----------------------------------

// add student 
router.post('/addStudent',passport.authenticate('accountant',{failureRedirect:'/api/accountant/unauthAccountant'}),[
    check('username').notEmpty().withMessage('Username is required').isLength({min:2}).withMessage('username must be atleast 2 carectore'),
    check('email').notEmpty().withMessage('email is required').isEmail().withMessage('Invalid Email').custom(async value=>{
        const isExistStudent = await Student.findOne({email:value});
        if(isExistStudent){
            throw new Error('This Email is Already Exist');
        }
    }),
],accCtl.addStudent);

// show all Student 
router.get('/viewStudent',passport.authenticate('accountant',{failureRedirect:'/api/accountant/unauthAccountant'}),accCtl.viewStudent);

router.get('/changeStudentStatus/:id/:status',passport.authenticate('accountant',{failureRedirect:'/api/accountant/unauthAccountant'}),accCtl.changeStudentStatus);

router.delete('/deleteStudent/:id',passport.authenticate('accountant',{failureRedirect:'/api/accountant/unauthAccountant'}),accCtl.deleteStudent);

module.exports = router;