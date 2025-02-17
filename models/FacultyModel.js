const mongoose = require('mongoose');

const facultySchema = mongoose.Schema({
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
        default:'faculty'
    },
    adminId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Admin',
        required:true
    },
    courseIds :[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course',
    }],
    status:{
        type:Boolean,
        default:true
    },
},{timestamps:true});


const Faculty = mongoose.model('Faculty',facultySchema);

module.exports = Faculty;