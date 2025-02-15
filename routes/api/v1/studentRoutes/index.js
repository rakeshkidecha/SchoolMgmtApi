const express = require('express');
const studentCtl = require('../../../../controller/api/v1/studentCtl');
const router = express.Router();
const passport = require('passport');

router.post('/studentLogin',studentCtl.studentLogin);

router.get('/studentProfile',passport.authenticate('student',{failureRedirect:'/api/student/unauthStudent'}),studentCtl.studentProfile);

router.all('/unauthStudent',async(req,res)=>{
    try {
        return res.status(401).json({msg:"Invalid Student Token"});
    } catch (err) {
        return res.status(400).json({msg:"Somethin Wrong"});
    }
});

router.put('/editStudentProfile/:id',passport.authenticate('student',{failureRedirect:'/api/student/unauthStudent'}),studentCtl.editStudentProfile);

router.post('/changeStudentPassword/:id',passport.authenticate('student',{failureRedirect:'/api/student/unauthStudent'}),studentCtl.changeStudentPassword);

router.get('/studentLogout',passport.authenticate('student',{failureRedirect:'/api/student/unauthStudent'}),studentCtl.studentLogout);

// forget password 
router.post('/sendOtp',studentCtl.sendOtp);

router.post('/forgetPassword/:email',studentCtl.forgetPassword);


module.exports = router;