const multer = require ('multer');
const path = require('path');
const fs = require('fs');
const appConfig = require('../../config/appConfig');



//multer storage engine

const storage = multer.diskStorage({
    destination:(req, file, cb) => {
      let dirRoot = appConfig.fileUploadDIR;
      //let dirRoot = path.join(process.cwd(),'public/uploads/');
      let dynamicPath = req.query.dYear + '/' + req.query.schoolName + '/' + req.query.gradeName+ '/' + req.query.exerciseName;
      let dir = dirRoot + dynamicPath;
      req.query.dynamicPath = dynamicPath;
      
      if (!fs.existsSync(dir)){
         fs.mkdirSync(dir,{recursive: true});
         cb(null, dir);
       }else{
         cb(null,dir);
       }
      
  },
    filename:(req,file,cb)=>{
      cb(null,file.fieldname + Date.now() + path.extname(file.originalname))
    }
  });
  
  //INIT upload
  
  const upload = multer({
    storage:storage
  });

  
  module.exports = {
      upload : upload
  }