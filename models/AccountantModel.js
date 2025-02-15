const mongoose = require('mongoose');

const accountantSchema = mongoose.Schema({
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
        default:'accountant'
    },
    adminId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Admin',
        required:true
    },
    studentIds:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student',
    }],
    status:{
        type:Boolean,
        default:true
    },
},{timestamps:true});


const Accountant = mongoose.model('Accountant',accountantSchema);

module.exports = Accountant;