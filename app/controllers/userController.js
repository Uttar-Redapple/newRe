const shortid = require('shortid');
const time = require('./../libs/timeLib');
const passwordLib = require('./../libs/generatePasswordLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const token = require('../libs/tokenLib')
const jwtTokenSecret = require('../../config/appConfig').jwtTokenSecret;  
let moment = require('moment');
let sequelize = require('../../config/sequelize');
let appConfig = require('../../config/appConfig');

let bcrypt        = require('bcrypt');
let salt          = bcrypt.genSaltSync(10);

/* Models */
//const UserModel = mongoose.model('User')
let User =  require('../schema/Schema').userSchema;
let AuthModel = require('../schema/Schema').sessionTokenSchema;
let userXP = require('../schema/Schema').userXP;
let userMissions = require('../schema/Schema').userMissions;
let achievements = require('../schema/Schema').userAchievements;
let usercoinvalue = require('../schema/Schema').userCoinValue;


// start of login function 
let loginFunction = async (req,res) => {
    console.log("findUser");
    try{
        //sync to your database!
        // await AuthModel.sync({force: true})
        // await User.sync({force: true}) 

        let findUser = await User.findOne({ where: {fb_id:req.body.fbId}});
        console.log(findUser);
        if(findUser == null){
            let createNewEntry = await User.create({
                fb_id:req.body.fbId,
                user_name:req.body.userName,
                img_url:req.body.imgUrl,
                created_at:moment.now()
            })
            console.log(createNewEntry);
            let createNewUserXP = await userXP.create({
                fb_id:req.body.fbId
            })
            console.log(createNewUserXP);
            let createNewUserMission = await userMissions.create({
                fb_id:req.body.fbId
            })
            console.log(createNewUserMission)
            let createNewUserCoin = await usercoinvalue.create({
                fb_id:req.body.fbId
            })
            console.log(createNewUserCoin)
            let createNewUserAchievement = await achievements.create({
                fb_id:req.body.fbId
            })
            console.log(createNewUserAchievement)
            let sessionToken = await token.generateToken(createNewEntry);
            console.log(sessionToken);
            if(sessionToken && sessionToken.token){
                let saveToken = await AuthModel.create({
                    fb_id:req.body.fbId,
                    auth_token:sessionToken.token,
                    token_secret:sessionToken.tokenSecret,
                    token_generation_time:moment.now()
                })
                console.log(saveToken);
                let userxp = await userXP.findOne({ where: {fb_id:req.body.fbId}});
                let userMissionData = await userMissions.findOne({ where: {fb_id:req.body.fbId}});
                let userAchievementData = await achievements.findOne({ where: {fb_id:req.body.fbId}});
                let userCoin = await usercoinvalue.findOne({ where: {fb_id:req.body.fbId}});
                //let resObj = (userAchievementData.achievements).split();
                let resObj;
                if(userAchievementData.achievements){
                    resObj = (userAchievementData.achievements).split();
                }else{
                    resObj = userAchievementData.achievements;
                }
                let apiResponse = response.generate(1, 'Token Generated Successfully',{sessionToken:sessionToken.token,uid:createNewEntry.fb_id,userXP:userxp.xp_value,userCoinValue:userCoin.coin_value,userMissionData:userMissionData.mission_value,userAchievementData:{fb_id:userAchievementData.fb_id,achievements:resObj?JSON.parse(resObj[0]):resObj}});
                res.send(apiResponse);
            }
        }else{
            let findSession = await AuthModel.findOne({ where: {fb_id:req.body.fbId}});
            console.log(findSession);
            if(findSession && findSession.auth_token){
                let sessionToken = await token.generateToken(findUser);
                let updateToken = await AuthModel.update({auth_token:sessionToken.token,token_secret:jwtTokenSecret},{ where: {fb_id:req.body.fbId}})
                if(updateToken && updateToken.length>>0){
                    let userxp = await userXP.findOne({ where: {fb_id:req.body.fbId}});
                    let userMissionData = await userMissions.findOne({ where: {fb_id:req.body.fbId}});
                    let userAchievementData = await achievements.findOne({ where: {fb_id:req.body.fbId}});
                    let userCoin = await usercoinvalue.findOne({ where: {fb_id:req.body.fbId}});
                    let resObj;
                    if(userAchievementData.achievements){
                        resObj = (userAchievementData.achievements).split();
                    }else{
                        resObj = userAchievementData.achievements;
                    }
                    let apiResponse = response.generate(1, 'Token Generated Successfully',{sessionToken:sessionToken.token,uid:req.body.fbId,userXP:userxp.xp_value,userCoinValue:userCoin.coin_value,userMissionData:userMissionData.mission_value,userAchievementData:{fb_id:userAchievementData.fb_id,achievements:resObj?JSON.parse(resObj[0]):resObj}});
                    res.send(apiResponse);
                }else{
                    let apiResponse = response.generate(0, 'Failed To Generate Token',null)
                    res.send(apiResponse);
           }               
            }
        }
    }catch(err){
        console.log(err);
        let apiResponse = response.generate(0, 'Failed To Generate Token',null)
        res.send(apiResponse);
    }
}

let getUserXP = async (req,res) => {
    try{
        let userxp = await userXP.findOne({ where: {fb_id:req.user.userId}});
        let apiResponse = response.generate(1,'user XP Fetched',{uid:req.user.userId,userXP:userxp.xp_value});
        res.send(apiResponse);
    }catch(err){
        console.error(err);
        let apiResponse = response.generate(0,`error:${err.message}`,null);
        res.send(apiResponse);
    }

}

let updateUserXP = async (req,res) => {
    try{
        if(check.isEmpty(req.body)){
            let apiResponse =response.generate(0,'update data object is not found in body payload',null);
            res.send(apiResponse);
        }else{
            let updateOptions = req.body;
            let updateUserxp = await userXP.update(updateOptions,{ where: {fb_id:req.user.userId}});
            if(updateUserxp && updateUserxp.length>>0){
                let apiResponse = response.generate(1,'data updated successfully',`XP data saved`);
                res.send(apiResponse);
            }else{
                let apiResponse = response.generate(0,'failed to update data',null);
                res.send(apiResponse);
            }
        }
    }catch(err){
        console.error(err);
        let apiResponse = response.generate(0,`error:${err.message}`,null);
        res.send(apiResponse);
    }
}

let getUserMissionData = async (req,res) => {
    try{
        let userMissionData = await userMissions.findOne({ where: {fb_id:req.user.userId}});
        let apiResponse = response.generate(1,'user mission data fetched',userMissionData);
        res.send(apiResponse);
    }catch(err){
        let apiResponse = response.generate(0,'could not retrieve data',null);
        res.send(apiResponse);
    }
} 
let updateUserMissionData = async (req,res) => {
    try{
        if(check.isEmpty(req.body)){
            let apiResponse =response.generate(0,'update data object is not found in body payload',null);
            res.send(apiResponse);
        }else{
            let updateOptions = req.body;
            let updateUsermissiondata = await userMissions.update(updateOptions,{ where: {fb_id:req.user.userId}});
            if(updateUsermissiondata && updateUsermissiondata.length>>0){
                let apiResponse = response.generate(1,'data updated successfully',`Mission data saved`);
                res.send(apiResponse);
            }else{
                let apiResponse = response.generate(0,'failed to update data',null);
                res.send(apiResponse);
            }
        }
    }catch(err){
        console.error(err);
        let apiResponse = response.generate(0,`error:${err.message}`,null);
        res.send(apiResponse);
    }
}

let getUserAchievementData = async (req,res) => {
    try{
        let userAchievementData = await achievements.findOne({ where: {fb_id:req.user.userId}});
        //let resObj = (userAchievementData.achievements).split();
        let resObj;
        if(userAchievementData.achievements){
            resObj = (userAchievementData.achievements).split();
        }else{
            resObj = userAchievementData.achievements;
        }
        let apiResponse = response.generate(1,'user Achievement data fetched',{fb_id:userAchievementData.fb_id,achievements:resObj?JSON.parse(resObj[0]):resObj});
        res.send(apiResponse);
    }catch(err){
        let apiResponse = response.generate(0,'could not retrieve data',null);
        res.send(apiResponse);
    }
}

let updateUserAchievementData = async (req,res) => {
    try{
        if(check.isEmpty(req.body)){
            let apiResponse =response.generate(true,'update data object is not found in body payload',402,null);
            res.send(apiResponse);
        }else{
            let updateOptions = {achievements:JSON.stringify(req.body)};
            let UserAchievementdata = await achievements.update(updateOptions,{ where: {fb_id:req.user.userId}});
            if(UserAchievementdata && UserAchievementdata.length>>0){
                let apiResponse = response.generate(1,'data updated successfully',`Achievement data saved`);
                res.send(apiResponse);
            }else{
                let apiResponse = response.generate(0,'failed to update data',null);
                res.send(apiResponse);
            }
        }
    }catch(err){
        console.error(err);
        let apiResponse = response.generate(0,`error:${err.message}`,null);
        res.send(apiResponse);
    }
}

let getUserCoinValue = async (req,res) => {
    try{
        let usercoin = await usercoinvalue.findOne({ where: {fb_id:req.user.userId}});
        let apiResponse = response.generate(1,'user Coins Fetched',{uid:req.user.userId,userCoinValue:usercoin.coin_value});
        res.send(apiResponse);
    }catch(err){
        console.error(err);
        let apiResponse = response.generate(0,`error:${err.message}`,null);
        res.send(apiResponse);
    }

}


let updateUserCoinValue = async (req,res) => {
    try{
        if(check.isEmpty(req.body)){
            let apiResponse =response.generate(0,'update data object is not found in body payload',null);
            res.send(apiResponse);
        }else{
            let updateOptions = req.body;
            let updateUserCoin = await usercoinvalue.update(updateOptions,{ where: {fb_id:req.user.userId}});
            if(updateUserCoin && updateUserCoin.length>>0){
                let apiResponse = response.generate(1,'data updated successfully',`Coin data saved`);
                res.send(apiResponse);
            }else{
                let apiResponse = response.generate(0,'failed to update data',null);
                res.send(apiResponse);
            }
        }
    }catch(err){
        console.error(err);
        let apiResponse = response.generate(0,`error:${err.message}`,null);
        res.send(apiResponse);
    }
}

let getLeaderBoard = async (req,res)=>{
    try{
        if(!req.headers.offset || req.headers.offset < 0){
            let apiResponse = response.generate(0,'offset value missing',null);
            res.send(apiResponse);
        }else{
            let resObj = {};
            let leaderBoardQuery = await userXP.findAndCountAll({order:[['xp_value','DESC']]});
            let leaderBoardArray =leaderBoardQuery.rows;
            leaderBoardArray =await Promise.all(leaderBoardArray.map(async (user)=>{
                let findOneUser = await User.findOne({ where: {fb_id:user.fb_id}});
                user.dataValues.user_name = findOneUser.user_name;
                //user.dataValues.is_online = findOneUser.is_online;
                return user;
            }));
            let resArray = [];
            let remainingCount = leaderBoardQuery.count - parseInt(req.headers.offset);
            if(leaderBoardArray.length > 0){
                if(remainingCount <= appConfig.MAXleaderBoardCount){
                    resObj.nextOffset = -1;
                    let limit = parseInt(req.headers.offset) + appConfig.MAXleaderBoardCount;
                    resArray = leaderBoardArray.slice(parseInt(req.headers.offset),limit);
                }else{                
                    resObj.nextOffset = parseInt(req.headers.offset) + appConfig.MAXleaderBoardCount;
                    resArray = leaderBoardArray.slice(parseInt(req.headers.offset),resObj.nextOffset);
                }
            }
            resObj.payload = resArray;
            let apiResponse = response.generate(1,'LeaderBoard Fetched',resObj);
            res.send(apiResponse);
        }
    }catch(err){
        console.error(err);
        let apiResponse = response.generate(0,`error:${err.message}`,null);
        res.send(apiResponse);
    }
}

module.exports = {
    loginFunction: loginFunction,
    getUserXP: getUserXP,
    updateUserXP: updateUserXP,
    getUserMissionData:getUserMissionData,
    updateUserMissionData:updateUserMissionData,
    getUserAchievementData:getUserAchievementData,
    updateUserAchievementData:updateUserAchievementData,
    getUserCoinValue:getUserCoinValue,
    updateUserCoinValue:updateUserCoinValue,
    getLeaderBoard:getLeaderBoard
}// end exports