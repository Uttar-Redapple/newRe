const jwt = require('jsonwebtoken')
const shortid = require('shortid')
const jwtTokenSecret = require('../../config/appConfig').jwtTokenSecret
const secretKey = jwtTokenSecret;


let generateToken = (data) => {

  try {
    let claims = {
      jwtid: shortid.generate(),
      iat: Date.now(),
      expiresIn: '365d',
      sub: 'authToken',
      iss: 'redApple',
      data: data
    }
    let tokenDetails = {
      token: jwt.sign(claims, secretKey),
      tokenSecret : secretKey
    }
    return tokenDetails;
  } catch (err) {
    console.log(err)
    return err;
  }
}// end generate token 

let verifyClaim = (token,secretKey,cb) => {
  // verify a token symmetric
  jwt.verify(token, secretKey, function (err, decoded) {
    if(err){
      console.log("error while verify token");
      console.log(err);
      cb(err,null)
    }
    else{
      console.log("user verified");
      console.log(decoded);
      cb(null,decoded);
    }  
 
 
  });


}// end verify claim 




module.exports = {
  generateToken: generateToken,
  verifyToken :verifyClaim
}
