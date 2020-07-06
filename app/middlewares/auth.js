const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const request = require("request")
const Auth = require('../schema/Schema').sessionTokenSchema;

const logger = require('./../libs/loggerLib')
const responseLib = require('./../libs/responseLib')
const token = require('./../libs/tokenLib')
const check = require('./../libs/checkLib')

let isAuthorized = async (req, res, next) => {
  

  if (req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')) {
    try{
      let authDetails = await Auth.findOne({where:{auth_token: req.header('authToken') || req.params.authToken || req.body.authToken || req.query.authToken}});
      console.log(authDetails);
      if(check.isEmpty(authDetails)){
           let apiResponse = responseLib.generate(0, 'Invalid Or Expired AuthorizationKey', {code:2})
          res.send(apiResponse)       
      }else{
        token.verifyToken(authDetails.auth_token,authDetails.token_secret,(err,decoded)=>{
            if(err){
                logger.error(err.message, 'Authorization Middleware', 10)
                let apiResponse = responseLib.generate(0, 'Failed To Authorize', {code:2})
                res.send(apiResponse)
            }
            else{                
                req.user = {userId: decoded.data.fb_id}
                next()
            }
        });
      }
    }catch(err){
      console.error(err);
      let apiResponse = responseLib.generate(0,'Authorization Failed',{code:2});
      res.send(apiResponse);
    }
  } else {
    logger.error('AuthorizationToken Missing', 'AuthorizationMiddleware', 5)
    let apiResponse = responseLib.generate(0, 'AuthorizationToken Is Missing In Request', {code:2})
    res.send(apiResponse)
  }
}


module.exports = {
  isAuthorized: isAuthorized
}
