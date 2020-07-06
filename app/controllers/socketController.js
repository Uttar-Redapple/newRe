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
let appConfig = require('../../config/appConfig');

let bcrypt        = require('bcrypt');
let salt          = bcrypt.genSaltSync(10);

/* Models */
const socketUsers = require('../schema/Schema').socketUsers;
const socketRooms = require('../schema/Schema').socketRooms;
//const UserModel = mongoose.model('User')
let User =  require('../schema/Schema').userSchema;
let AuthModel = require('../schema/Schema').sessionTokenSchema;
let userXP = require('../schema/Schema').userXP;
let userMissions = require('../schema/Schema').userMissions;
let achievements = require('../schema/Schema').userAchievements;
let invitationDetails = require('../schema/Schema').invitationDetails;



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

let getUserRoomDetails = async (req,res) => {
    try{
        let socketUserDetails = await socketUsers.findOne({ where: {user_id:req.user.userId}});
        if(socketUserDetails.room_id){
            let roomDetails = await socketRooms.findOne({ where: {room_id:socketUserDetails.room_id}});
            let apiResponse = response.generate(1,'socket room details fetched',roomDetails);
            res.send(apiResponse);
        }else{
            let apiResponse = response.generate(0,'user has not joined a socket room',null);
            res.send(apiResponse);
        }
    }catch(err){
        let apiResponse = response.generate(0,`error:${err.message}`,null);
        res.send(apiResponse);
    }
}

let getInvitationDetails = async (req,res) => {
    try{
        let invitations = await invitationDetails.findAll({ where: {sender_id:req.user.userId}});
        if(check.isEmpty(invitations)){
            let apiResponse = response.generate(0,'user not sent any invitations yet',null);
            res.send(apiResponse);
        }else{
            let apiResponse = response.generate(1,'sent invitation details fetched',invitations);
            res.send(apiResponse);
        }
    }catch(err){
        let apiResponse = response.generate(0,`error:${err.message}`,null);
        res.send(apiResponse);
    }
}

let joinRoomByAccessKey = async (req,res) => {
    try{
        let findUser = await socketUsers.findOne({ where: {user_id:req.user.userId}});
        if(findUser && findUser.room_id){
            let apiResponse = response.generate(0,'Already Joined in another Room,leave room first',null);
            res.send(apiResponse);
        }else if(findUser == null){
            let roomDetails = await socketRooms.findOne({where: {room_key:req.body.room_key}});
            if(roomDetails){
                if(roomDetails.player_count < appConfig.MAXroomLimit){
                   let userObj = {
                       user_id:req.user.userId,
                       room_id:roomDetails.room_id
                   }
                   let createUser = await socketUsers.create(userObj,{ where: {user_id:req.user.userId}});
                   console.log(createUser);
                   roomDetails.player_count += 1;
                   let updateRoom = await socketRooms.update({player_count:roomDetails.player_count},{ where: {room_id:roomDetails.room_id}});
                   console.log(updateRoom);
                   let allUsers = await socketUsers.findAll({ where: {room_id:roomDetails.room_id}});
                   allUsers =await Promise.all(allUsers.map(async (user)=>{
                       let findOneUser = await User.findOne({ where: {fb_id:user.user_id}});
                       user.dataValues.user_name = findOneUser.user_name;
                       //user.dataValues.is_online = findOneUser.is_online;
                       return user;
                   }));
                   roomDetails.dataValues.joinedUsers = allUsers;
                   let apiResponse = response.generate(1,'User added to room',roomDetails);
                   res.send(apiResponse);
                }else if(roomDetails.player_count >= appConfig.MAXroomLimit){
                    let allUsers = await socketUsers.findAll({ where: {room_id:roomDetails.room_id}});
                    allUsers =await Promise.all(allUsers.map(async (user)=>{
                        let findOneUser = await User.findOne({ where: {fb_id:user.user_id}});
                        user.dataValues.user_name = findOneUser.user_name;
                        //user.dataValues.is_online = findOneUser.is_online;
                        return user;
                    }));
                    let apiResponse = response.generate(0,'Room is already full',null);
                    res.send(apiResponse);
                }
            }else{
                let apiResponse = response.generate(0,'No room Found with the specified key',null);
                res.send(apiResponse);
            }
        }else if(findUser && findUser.room_id == null){
            let roomDetails = await socketRooms.findOne({where: {room_key:req.body.room_key}});
            if(roomDetails){
                if(roomDetails.player_count < appConfig.MAXroomLimit){
                   let userObj = {
                       room_id:roomDetails.room_id
                   }
                   let updateUser = await socketUsers.update(userObj,{ where: {user_id:req.user.userId}});
                   console.log(updateUser);
                   roomDetails.player_count += 1;
                   let updateRoom = await socketRooms.update({player_count:roomDetails.player_count},{ where: {room_id:roomDetails.room_id}});
                   console.log(updateRoom);
                   let allUsers = await socketUsers.findAll({ where: {room_id:roomDetails.room_id}});
                   allUsers =await Promise.all(allUsers.map(async (user)=>{
                       let findOneUser = await User.findOne({ where: {fb_id:user.user_id}});
                       user.dataValues.user_name = findOneUser.user_name;
                       //user.dataValues.is_online = findOneUser.is_online;
                       return user;
                   }));
                   roomDetails.dataValues.joinedUsers = allUsers;
                   let apiResponse = response.generate(1,'User added to room',roomDetails);
                   res.send(apiResponse);
                }else if(roomDetails.player_count >= appConfig.MAXroomLimit){
                    let allUsers = await socketUsers.findAll({ where: {room_id:roomDetails.room_id}});
                    allUsers =await Promise.all(allUsers.map(async (user)=>{
                        let findOneUser = await User.findOne({ where: {fb_id:user.user_id}});
                        user.dataValues.user_name = findOneUser.user_name;
                        //user.dataValues.is_online = findOneUser.is_online;
                        return user;
                    }));
                    let apiResponse = response.generate(0,'Room is already full',null);
                    res.send(apiResponse);
                }
            }else{
                let apiResponse = response.generate(0,'No room Found with the specified key',null);
                res.send(apiResponse);
            }
        }
    }catch(err){
        let apiResponse = response.generate(0,`error:${err.message}`,null);
        res.send(apiResponse);
    }
}

module.exports = {
    getUserXP: getUserXP,
    getUserRoomDetails:getUserRoomDetails,
    getInvitationDetails:getInvitationDetails,
    joinRoomByAccessKey:joinRoomByAccessKey
}// end exports