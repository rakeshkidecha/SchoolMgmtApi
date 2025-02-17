const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:'admin'
    },
    facultyIds:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Faculty'
    }],
    accountantIds:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Accountant'
    }],
    status:{
        type:Boolean,
        default:true
    },
},{timestamps:true});


const Admin = mongoose.model('Admin',adminSchema);

module.exports = Admin;