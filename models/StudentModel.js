const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
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
        default:'student'
    },
    adminId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Admin',
        required:true
    },
    accountantId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Accountant',
        required:true
    },
    status:{
        type:Boolean,
        default:true
    },
},{timestamps:true});


const Student = mongoose.model('Student',studentSchema);

module.exports = Student;