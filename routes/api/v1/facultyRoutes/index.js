const express = require('express');
const facultyCtl = require('../../../../controller/api/v1/facultyCtl');
const router = express.Router();
const passport = require('passport');

router.post('/facultyLogin',facultyCtl.facultyLogin);

router.get('/facultyProfile',passport.authenticate('faculty',{failureRedirect:'/api/faculty/unauthFaculty'}),facultyCtl.facultyProfile);

router.all('/unauthFaculty',(req,res)=>{
    try {
        return res.status(401).json({msg:"Invalid Faculty Token"})
    } catch (err) {
        return res.status(400).json({msg:"Something Wrong",errors:err});
    }
});

router.put('/editFacultyProfile/:id',passport.authenticate('faculty',{failureRedirect:'/api/faculty/unauthFaculty'}),facultyCtl.editFacultyProfile);

router.post('/changeFacultyPassword',passport.authenticate('faculty',{failureRedirect:'/api/faculty/unauthFaculty'}),facultyCtl.changeFacultyPassword);

router.get('/facultyLogOut',passport.authenticate('faculty',{failureRedirect:'/api/faculty/unauthFaculty'}),facultyCtl.facultyLogOut);

// forget password 
router.post('/checkEmail',facultyCtl.checkEmail);

router.post('/forgetPassword/:email',facultyCtl.forgetPassword);

module.exports = router;