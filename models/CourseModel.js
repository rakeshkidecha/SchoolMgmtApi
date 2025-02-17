const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    skill:{
        type:Array,
        required:true
    },
    role:{
        type:String,
        default:'course'
    },
    adminId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Admin',
        required:true
    },
    facultyId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Faculty',
        required:true
    },
    status:{
        type:String,
        required:true
    },
},{timestamps:true});


const Course = mongoose.model('Course',courseSchema);

module.exports = Course;