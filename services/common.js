const Faculty = require('../models/FacultyModel');
const Admin = require('../models/AdminModel');
const Accountant = require('../models/AccountantModel');
const Student = require('../models/StudentModel');

module.exports.chnageStatus =async (id,status,modelName)=>{
    let Model;

    if(modelName=='Faculty'){
        Model = Faculty;
    }else if(modelName=='Accountant'){
        Model = Accountant
    }else if(modelName=='Student'){
        Model = Student;
    }

    const isExistData = await Model.findById(id);
    if(!isExistData){
        return {statusCode:404,msg:"Student not Found"};
    }

    const chnageStatus = await Model.findByIdAndUpdate(id,{status:!status});
    if(chnageStatus){
        return {statusCode:200,msg:`${modelName} Status Changed`};
    }else{
        return {statusCode:400,msg:`Failed to change ${modelName} Status`};
    }
};

module.exports.deletData = async (id,modelName)=>{
    let Model;

    if(modelName=='Faculty'){
        Model = Faculty;
    }else if(modelName=='Accountant'){
        Model = Accountant
    }else if(modelName=='Student'){
        Model = Student;
    }

    const deleteData = await Model.findByIdAndDelete(id);
    if(deleteData){
        if(modelName=='Faculty' || modelName=='Accountant'){
            // remove faculty or Accountant id from admin 
            const singleAdmin = await Admin.findById(deleteData.adminId);
            if(modelName=='Faculty'){
                singleAdmin.facultyIds.splice(singleAdmin.facultyIds.indexOf(deleteData._id),1);
            }else{
                singleAdmin.accountantIds.splice(singleAdmin.accountantIds.indexOf(deleteData._id),1);
            }
            await Admin.findByIdAndUpdate(singleAdmin._id,singleAdmin);
        }
        if(modelName == 'Student'){
            // remove Accountant id from admin 
            const singleAccountant = await Accountant.findById(deleteData.accountantId);
            singleAccountant.studentIds.splice(singleAccountant.studentIds.indexOf(deleteData._id),1);
            await Accountant.findByIdAndUpdate(singleAccountant._id,singleAccountant);
        }
        return {statusCode : 200,msg:`${modelName} Deleted`,data:deleteData};
    }else{
        return {statusCode : 200,msg:`${modelName} not Deleted`,data:deleteData};
    }
}