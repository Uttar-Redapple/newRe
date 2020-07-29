const shortid = require('shortid');
const time = require('../libs/timeLib');
const passwordLib = require('../libs/generatePasswordLib');
const response = require('../libs/responseLib')
const logger = require('../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const token = require('../libs/tokenLib')
const jwtTokenSecret = require('../../config/appConfig').jwtTokenSecret; 
let moment = require('moment');
let appConfig = require('../../config/appConfig');

let bcrypt        = require('bcrypt');
let salt          = bcrypt.genSaltSync(10);

/* Models */
const gallery = require('../schema/Schema').gallerySchema;
const schoolProjects = require('../schema/Schema').schoolProjectsSchema;



let uploadHandler = async (req,res) =>{
    try{
       let fileName = req.file.filename;
    //    let filepath = req.file.path;
    //    let resObj = {
    //       fileName:fileName,
    //       filepath:filepath
    //    }
       let schoolProjectObj = {
        syear:req.query.dYear.toString(),
        school_id:parseInt(req.query.schoolID),
        grade_id:parseInt(req.query.gradeID),
        short_name:null,
        title:req.query.exerciseName.toString(),
        sort_order:null,
        is_approved:0
       };
       let updateSchoolProject = await schoolProjects.create(schoolProjectObj);
       console.log(updateSchoolProject);
       let createGalleryObj = {
        school_id:parseInt(req.query.schoolID),
        grade_id:parseInt(req.query.gradeID),
        exercise_id:parseInt(req.query.exerciseID),
        project_id :updateSchoolProject.dataValues.id,
        gallery_path:req.query.dynamicPath.toString() + '/' + fileName,
        year:req.query.dYear.toString(),
        is_approved:1
       };
       let updateGallery = await gallery.create(createGalleryObj);
       console.log(updateGallery);
    //    let uploadCheck = await gallery.findOne({ where: {id:356147}});
    //    console.log(uploadCheck);
       let apiResponse = response.generate(1,`${fileName} uploaded successfully!`,updateGallery.dataValues);
       res.send(apiResponse);
    }catch(err){
        let apiResponse = response.generate(0,`error:${err.message}`,null);
        res.send(apiResponse);
    }
};


module.exports = {
    uploadHandler: uploadHandler
}// end exports