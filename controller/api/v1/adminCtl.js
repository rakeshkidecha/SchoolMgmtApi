const Admin = require('../../../models/AdminModel');
const {validationResult} = require('express-validator');
const sendMailer = require('../../../services/sendMailer');
const env = require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Faculty = require('../../../models/FacultyModel');
const Accountant = require('../../../models/AccountantModel');
const Student = require('../../../models/StudentModel');
const common = require('../../../services/common');

function passwordGanreter(){
    const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    let pass = '';
    for(let i =0 ;i<8;i++){
        pass += str.charAt(Math.floor(Math.random()*str.length)+1);
    };

    return pass;
}

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
};

// forget password 
module.exports.sendOtp = async(req,res)=>{
    try {
        const isExistEmail = await Admin.findOne({email:req.body.email});

        let OTP;
        do {
          OTP = Math.ceil(Math.random()*10000);  
        } while (OTP.toString().length != 4);

        if(isExistEmail){
            const sub = "Verification OTP";
            const content =  `<p>Your OTP for forget password is <b>${OTP}</b></p>`;

            const info = await sendMailer(isExistEmail.email,sub,content);
            
            if(info){
                return res.status(200).json({msg:"OTP Send on mail Successfully",data:{email:isExistEmail.email,OTP}})
            }else{
                return res.status(400).json({msg:'Mail not send'});
            }


        }else{
            return res.status(400).json({msg:'Invalid Email'});
        }

    } catch (err) {
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
};

module.exports.forgetPassword = async(req,res)=>{
    try {
        const isExistEmail = await Admin.findOne({email:req.params.email});
        if(isExistEmail){
            if(req.body.newPassword == req.body.confirmPassword){
                const newPass = await bcrypt.hash(req.body.newPassword,10);
                const updatePass = await Admin.findByIdAndUpdate(isExistEmail._id,{password:newPass});
                if(updatePass){
                    return res.status(200).json({msg:"Password updated, Go to Login"});
                }else{
                    return res.status(400).json({msg:'Password not updated'});
                }
            }else{
                return res.status(400).json({msg:"New and Confirm Passsword are not Match"});
            }
        }else{
            return res.status(400).json({msg:'Invalid Email'});
        }
    } catch (err) {
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
};


// add faculty /
module.exports.addFaculty = async(req,res)=>{
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(403).json({msg:"Invalid Credential",errors:errors.mapped()});
        }

        const pass = passwordGanreter()
        req.body.password = await bcrypt.hash(pass,10);
        req.body.adminId = req.user._id;

        const addedFaculty = await Faculty.create(req.body);
        if(addedFaculty){
            // add faculty id to admin 
            const singleAdmin = await Admin.findById(addedFaculty.adminId);
            singleAdmin.facultyIds.push(addedFaculty._id);
            await Admin.findByIdAndUpdate(singleAdmin._id,singleAdmin);

            const sub = 'Login Information';
            const content = `
                <h1>Your Login Information</h1>
                <p>Email : ${addedFaculty.email}</p>
                <p>Email : ${pass}</p>
                <p>Login Link : ${req.body.facultyLoginLink} </p>
            `
            const info =await sendMailer(addedFaculty.email,sub,content);
            if(info){
                return res.status(200).json({msg:"Check Your Email For Login"});
            }else{
                return res.status(400).json({msg:"Failed to Send Email"});
            }
        }else{
            return res.status(400).json({msg:'Faculty not added'});
        }

    } catch (err) {
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
};

// add Accountant 
module.exports.addAccoutant = async(req,res)=>{
    try {

        const pass = passwordGanreter();
        req.body.password = await bcrypt.hash(pass,10);
        req.body.adminId = req.user._id;

        const addedAccountant = await Accountant.create(req.body);

        if(addedAccountant){
            // add faculty id to admin 
            const singleAdmin = await Admin.findById(addedAccountant.adminId);
            singleAdmin.accountantIds.push(addedAccountant._id);
            await Admin.findByIdAndUpdate(singleAdmin._id,singleAdmin);

            const sub = 'Login Information';
            const content = `
                <h1>Your Login Information</h1>
                <p>Email : ${addedAccountant.email}</p>
                <p>Email : ${pass}</p>
                <p>Login Link : ${req.body.accountantLoginLink} </p>
            `
            const info = await sendMailer(addedAccountant.email,sub,content);
            if(info){
                return res.status(200).json({msg:"Check Your Email For Login"});
            }else{
                return res.status(400).json({msg:"Failed to Send Email"});
            }
        }else{
            return res.status(400).json({msg:'Faculty not added'});
        }

    } catch (err) {
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
};


// view faculty .
module.exports.viewFaculty = async(req,res)=>{
    try {
        let search = req.query.search || '';
        let perPageData = 2
        let page = parseInt(req.query.page) || 0;
        
        let sort = parseInt(req.query.sort) || null;
        let sortType = req.query.sortType || null;

        const allFaculty = await Faculty.find({
            adminId:req.user._id,
            $or:[
                {username:{$regex:search,$options:'i'}},
                {email:{$regex:search,$options:'i'}},
            ]
        }).sort({...(sort&&sortType&&{[sortType]:sort})}).skip(perPageData*page).limit(perPageData);

        const totalFaculty = await Faculty.find({
            adminId:req.user._id,
            $or:[
                {username:{$regex:search,$options:'i'}},
                {email:{$regex:search,$options:'i'}},
            ]
        }).countDocuments();

        const totalPage = Math.ceil(totalFaculty/perPageData);

        if(allFaculty){
            return res.status(200).json({
                msg:"Faculty data",
                data:allFaculty,
                totalPage,
                ...(totalPage>0&&{page}),
                ...(search&&{search}),
                ...(sort&&{sort}),
                ...(sortType&&{sortType}),
            });
        }else{
            return res.status(404).json({msg:'Faculty data not found'});
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
}

module.exports.changeFacultyStatus = async(req,res)=>{
    try {
        const result = await common.chnageStatus(req.params.id,JSON.parse(req.params.status),'Faculty')
        return res.status(result.statusCode).json({msg:result.msg});
    } catch (err) {
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
};

module.exports.deleteFaculty = async(req,res)=>{
    try {
        const result = await common.deletData(req.params.id,'Faculty');
        return res.status(result.statusCode).json({msg:result.msg});
    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
}

// view Accountant .
module.exports.viewAccountant = async(req,res)=>{
    try {
        let search = req.query.search || '';
        let perPageData = 2
        let page = parseInt(req.query.page) || 0;
        
        let sort = parseInt(req.query.sort) || null;
        let sortType = req.query.sortType || null;

        const allAccountant = await Accountant.find({
            adminId:req.user._id,
            $or:[
                {username:{$regex:search,$options:'i'}},
                {email:{$regex:search,$options:'i'}},
            ]
        }).sort({...(sort&&sortType&&{[sortType]:sort})}).skip(perPageData*page).limit(perPageData);

        const totalAccountant = await Accountant.find({
            adminId:req.user._id,
            $or:[
                {username:{$regex:search,$options:'i'}},
                {email:{$regex:search,$options:'i'}},
            ]
        }).countDocuments();

        const totalPage = Math.ceil(totalAccountant/perPageData);

        if(allAccountant){
            return res.status(200).json({
                msg:"Accountant data",
                data:allAccountant,
                totalPage,
                ...(totalPage>0&&{page}),
                ...(search&&{search}),
                ...(sort&&{sort}),
                ...(sortType&&{sortType}),
            });
        }else{
            return res.status(404).json({msg:'Accountant data not found'});
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
};

module.exports.changeAccountantStatus =async(req,res)=>{
    try {
        const result = await common.chnageStatus(req.params.id,JSON.parse(req.params.status),'Accountant')
        return res.status(result.statusCode).json({msg:result.msg});
    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
};

module.exports.deleteAccountant = async(req,res)=>{
    try {
        const deletedAccountant = await Accountant.findByIdAndDelete(req.params.id);
        if(deletedAccountant){
            // remove Accountant id from admin 
            const singleAdmin = await Admin.findById(deletedAccountant.adminId);
            singleAdmin.accountantIds.splice(singleAdmin.facultyIds.indexOf(deletedAccountant._id),1);
            await Admin.findByIdAndUpdate(singleAdmin._id,singleAdmin);

            return res.status(200).json({msg:"Accountant Deleted",data:deletedAccountant});
        }else{
            return res.status(400).json({msg:"Failed to delete Accountant"});
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
}

// view Student .
module.exports.viewStudent = async(req,res)=>{
    try {
        let search = req.query.search || '';
        let perPageData = 2
        let page = parseInt(req.query.page) || 0;
        
        let sort = parseInt(req.query.sort) || null;
        let sortType = req.query.sortType || null;

        const allStudent = await Student.find({
            adminId:req.user._id,
            $or:[
                {username:{$regex:search,$options:'i'}},
                {email:{$regex:search,$options:'i'}},
            ]
        }).sort({...(sort&&sortType&&{[sortType]:sort})}).skip(perPageData*page).limit(perPageData);

        const totalStudent = await Student.find({
            adminId:req.user._id,
            $or:[
                {username:{$regex:search,$options:'i'}},
                {email:{$regex:search,$options:'i'}},
            ]
        }).countDocuments();

        const totalPage = Math.ceil(totalStudent/perPageData);

        if(allStudent){
            return res.status(200).json({
                msg:"Student data",
                data:allStudent,
                totalPage,
                ...(totalPage>0&&{page}),
                ...(search&&{search}),
                ...(sort&&{sort}),
                ...(sortType&&{sortType}),
            });
        }else{
            return res.status(404).json({msg:'Accountant data not found'});
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
};

module.exports.changeStudentStatus = async(req,res)=>{
    try {
        const result = await common.chnageStatus(req.params.id,JSON.parse(req.params.status),'Student')
        return res.status(result.statusCode).json({msg:result.msg});
    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
};

module.exports.deleteStudent = async(req,res)=>{
    try {
        const result = await common.deletData(req.params.id,JSON.parse(req.params.status),'Student')
        return res.status(result.statusCode).json({msg:result.msg});
    } catch (err) {
        console.log(err);
        return res.status(400).json({msg:'Something Wrong',errors:err});
    }
}