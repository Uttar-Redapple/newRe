var schema = {};

var sequelize = require('../../config/sequelize');
var Sequelize = require('sequelize');


/** MASTER TABLE DEFINATION  */

schema.gallerySchema =  sequelize.define('gallery', {   
      school_id:{
        type:Sequelize.INTEGER
      },
      grade_id:{
        type:Sequelize.INTEGER
      },
      exercise_id:{
        type:Sequelize.INTEGER
      },
      project_id: {
        type: Sequelize.INTEGER
      },
      gallery_path: {
        type: Sequelize.STRING
      },
      year: {
        type: Sequelize.STRING
      },
      is_approved: {
        type: Sequelize.INTEGER
      }
},{
    tableName: 'gallery',
    "timestamps": false,
    "underscored": true
}); 

schema.schoolProjectsSchema =  sequelize.define('school_projects', {    
      syear: {
        type:Sequelize.STRING
      },
      school_id: {
        type:Sequelize.INTEGER
      },
      grade_id: {
        type:Sequelize.INTEGER
      },
      short_name: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      sort_order: {
        type: Sequelize.INTEGER
      },
      is_approved: {
        type: Sequelize.INTEGER
      }
},{
  tableName: 'school_projects',
  "timestamps": false,
  "underscored": true
}); 

module.exports  = schema;