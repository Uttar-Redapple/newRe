const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const http = require('http');
const appConfig = require('./config/appConfig');
const logger = require('./app/libs/loggerLib');
const routeLoggerMiddleware = require('./app/middlewares/routeLogger.js');
const globalErrorMiddleware = require('./app/middlewares/appErrorHandler');
const morgan = require('morgan');
var sequelize = require('./config/sequelize');
let env       = appConfig.environment;
let dbConfig    = require('./config/dbConfig.json')[env];
const websocket = require('./app/www/socket');
const restful = require ('./app/www/restful');
//const multer = require ('multer');
let response = require('./app/libs/responseLib');

//multer storage engine

// const storage = multer.diskStorage({
//   destination:(req, file, cb) => {
//     //let dirRoot = './public/uploads/';
//     let dirRoot = path.join(process.cwd(),'public/uploads/');
//     let dir = dirRoot + req.query.Year + '/' + req.query.schoolName + '/' + req.query.Grade + '/' + req.query.ExerciseName;
    
//     if (!fs.existsSync(dir)){
//        fs.mkdirSync(dir,{recursive: true});
//        cb(null, dir);
//      }else{
//        cb(null,dir);
//      }
    
// },
//   filename:(req,file,cb)=>{
//     cb(null,file.fieldname + Date.now() + path.extname(file.originalname))
//   }
// })

//INIT upload

// const upload = multer({
//   storage:storage
// })



app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/',express.static(path.join(__dirname, 'public')));
app.use(routeLoggerMiddleware.logIp);
app.use(globalErrorMiddleware.globalErrorHandler);


//app.use(express.static(path.join(__dirname, 'client')));


const routesPath = './app/routes';

// app.post('/uploadImage',upload.single('screenshot'),(req,res,next)=>{
//   let fileName = req.file.filename;
//   let filepath = req.file.path;
//   let resObj = {
//     fileName:fileName,
//     filepath:filepath
//   }
//   console.log(resObj);
//   let apiResponse = response.generate(1,`${fileName}  uploaded!`,resObj)
//   res.send(apiResponse);
// })

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    next();
});


// Bootstrap route
fs.readdirSync(routesPath).forEach(function (file) {
  //console.log(routesPath);
  if (~file.indexOf('.js')) {
    let route = require(routesPath + '/' + file);
    //console.log(route);
    route.setRouter(app);
  }
});
// end bootstrap route

// calling global 404 handler after route

app.use(globalErrorMiddleware.globalNotFoundHandler);

// end global 404 handler

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
// start listening to http server
//console.log(appConfig);
server.listen(appConfig.restfulport);
server.on('error', onError);
server.on('listening', onListening);

// end server listening code

// socket io connection handler 
//const socketServer = websocket.setServer(server);


// end socketio connection handler

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    logger.error(error.code + ' not equal listen', 'serverOnErrorHandler', 10)
    throw error;
  }


  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(error.code + ':elavated privileges required', 'serverOnErrorHandler', 10);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(error.code + ':port is already in use.', 'serverOnErrorHandler', 10);
      process.exit(1);
      break;
    default:
      logger.error(error.code + ':some unknown error occured', 'serverOnErrorHandler', 10);
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  ('Listening on ' + bind);
  logger.info('server listening on port' + addr.port, 'serverOnListeningHandler', 10);
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});


/**
 * database connection settings
 */


sequelize
.authenticate()
.then(() => {
  console.log(`Database Connection has been established successfully.Using Port:${dbConfig.port}`);
})
.catch(err => {
  console.error('Unable to connect to the database:', err);
});

module.exports = app;
