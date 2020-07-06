/* Models */
const socketUsers = require('../schema/Schema').socketUsers;
const socketRooms = require('../schema/Schema').socketRooms;
const users = require('../schema/Schema').userSchema;
const Auth = require('../schema/Schema').sessionTokenSchema;
const invitationDetails = require('../schema/Schema').invitationDetails;
const check = require('../libs/checkLib');
const tokenLib= require('../libs/tokenLib');
const appConfig = require('../../config/appConfig');



let createUser = async (data)=>{
    try{
        let findUser = await socketUsers.findOne({ where: {user_id:data.user_id}});
        if(findUser){
            let updateUser = await socketUsers.update(data,{ where: {user_id:data.user_id}});
            console.log(updateUser);
            let findRoom = await socketRooms.findOne({ where: {room_id:findUser.room_id}});
            // findRoom.player_count+=1;
            // await socketRooms.update({player_count:findRoom.player_count},{ where: {room_id:findUser.room_id}});
            // let updateRoom = await socketRooms.findOne({ where: {room_id:findUser.room_id}});
            let allUsers = await socketUsers.findAll({ where: {room_id:findUser.room_id}});
            allUsers =await Promise.all(allUsers.map(async (user)=>{
                let findOneUser = await users.findOne({ where: {fb_id:user.user_id}});
                user.dataValues.user_name = findOneUser.user_name;
                //user.dataValues.is_online = findOneUser.is_online;
                return user;
            }));
            return {allUsers:allUsers,room:findRoom};
        }else{
            let newUser = await socketUsers.create(data);
            console.log(newUser);
            let allUsers = await socketUsers.findAll();
            return {allUsers:allUsers,room:null};
        }

    }catch(err){
        return err;
    }    
}

let updateUserOnlineStatus = async (data)=>{
    try{
        let findUser = await socketUsers.findOne({ where: {socket_id:data.socket_id}});
        if(findUser && findUser.socket_id){
            let updateUser = await socketUsers.update({is_online:data.is_online},{ where: {socket_id:data.socket_id}});
            console.log(updateUser);
            return updateUser;
        }else{
            return null;
        }
    }catch(err){
        return err;
    }
}

let getUserSocketById = async (data)=>{
    try{
        let userSocketId = await socketUsers.findOne({ where: {user_id:data}});
        return userSocketId;
    }catch(err){
        return err;
    }
}

let createRoom = async (data)=>{
    try{
        let findUser = await socketUsers.findOne({ where: {user_id:data.created_by}});
        if(findUser.room_id == null){
            let findRoom = await socketRooms.findOne({ where: {room_name:data.room_name}});
            let isExist = {};
            if(findRoom && findRoom.room_name){
                if(findRoom.created_by == data.created_by){
                    //let updateRoom = await socketRooms.update(data,{ where: {room_name:data.room_name}});
                    //let updateUser = await socketUsers.update({room_id:data.room_id},{ where: {user_id:data.created_by}});
                    //console.log(updateRoom);
                    //console.log(updateUser);
                    isExist.room_id = findRoom.room_id;
                    isExist.room_name = findRoom.room_name;
                    isExist.room_key = findRoom.room_key;
                    isExist.created_by = findRoom.created_by;
                    isExist.player_count = findRoom.player_count;
    
                    let allUsers = await socketUsers.findAll({ where: {room_id:findRoom.room_id}});
                    //let allUsersModify = [];
        
                    allUsers =await Promise.all(allUsers.map(async (user)=>{
                        let findOneUser = await users.findOne({ where: {fb_id:user.user_id}});
                        user.dataValues.user_name = findOneUser.user_name;
                        //user.dataValues.is_online = findOneUser.is_online;
                        return user;
                    }));
                    return {isExist:isExist,allUsers:allUsers};
                }else{
                    let newRoom = await socketRooms.create(data);
                    let updateUser = await socketUsers.update({room_id:data.room_id},{ where: {user_id:data.created_by}});
                    console.log(newRoom);
                    console.log(updateUser);
    
                    let allUsers = await socketUsers.findAll({ where: {room_id:data.room_id}});
                    //let allUsersModify = [];
        
                    allUsers =await Promise.all(allUsers.map(async (user)=>{
                        let findOneUser = await users.findOne({ where: {fb_id:user.user_id}});
                        user.dataValues.user_name = findOneUser.user_name;
                        //user.dataValues.is_online = findOneUser.is_online;
                        return user;
                    }));
                    return {isExist:isExist,allUsers:allUsers};
                }
                //let allRooms = await socketRooms.findAll();
     
                //Promise.resolve(allRooms);
                // Promise.all(allRooms).then((resP)=>{
                //     return resP;
                // });
            }else{
                let newRoom = await socketRooms.create(data);
                let updateUser = await socketUsers.update({room_id:data.room_id},{ where: {user_id:data.created_by}});
                console.log(updateUser);
                console.log(newRoom);
                //let allRooms = await socketRooms.findAll();
                let allUsers = await socketUsers.findAll({ where: {room_id:data.room_id}});
                //Promise.resolve(allRooms);
                // Promise.all(allRooms).then((resP)=>{
                //     return resP;
                // });
                allUsers =await Promise.all(allUsers.map(async (user)=>{
                    let findOneUser = await users.findOne({ where: {fb_id:user.user_id}});
                    user.dataValues.user_name = findOneUser.user_name;
                    //user.dataValues.is_online = findOneUser.is_online;
                    return user;
                }));
                return {isExist:null,allUsers:allUsers};
            }
        }else{
            let findRoom = await socketRooms.findOne({ where: {room_id:findUser.room_id}});
            let allUsers = await socketUsers.findAll({ where: {room_id:findUser.room_id}});
            allUsers =await Promise.all(allUsers.map(async (user)=>{
                let findOneUser = await users.findOne({ where: {fb_id:user.user_id}});
                user.dataValues.user_name = findOneUser.user_name;
                //user.dataValues.is_online = findOneUser.is_online;
                return user;
            }));
            return {allUsers:allUsers,room:findRoom}; 
        }

    }catch(err){
        return err;
    }
}

let joinRoom = async (data)=>{
    try{
        let findRoom = await socketRooms.findOne({ where: {room_id:data.room_id}});
        let isFilled =false;
        if(findRoom && findRoom.room_key == data.room_key ){
            if(findRoom.player_count < appConfig.MAXroomLimit){
                let updateUser = await socketUsers.update({room_id:data.room_id},{ where: {user_id:data.user_id}});
                // let count = findRoom.player_count;
                // count +=1;
                findRoom.player_count+=1;
                let updateRoom = await socketRooms.update({player_count:findRoom.player_count},{ where: {room_id:data.room_id}});
                console.log(updateUser);
                console.log(updateRoom)
                let allUsers = await socketUsers.findAll({ where: {room_id:data.room_id}});
                allUsers =await Promise.all(allUsers.map(async (user)=>{
                    let findOneUser = await users.findOne({ where: {fb_id:user.user_id}});
                    user.dataValues.user_name = findOneUser.user_name;
                    //user.dataValues.is_online = findOneUser.is_online;
                    return user;
                }));
                return {allUsers:allUsers,room:findRoom,isFilled:isFilled};
            }else if(findRoom.player_count >= appConfig.MAXroomLimit){
                let allUsers = await socketUsers.findAll({ where: {room_id:data.room_id}});
                allUsers =await Promise.all(allUsers.map(async (user)=>{
                    let findOneUser = await users.findOne({ where: {fb_id:user.user_id}});
                    user.dataValues.user_name = findOneUser.user_name;
                    //user.dataValues.is_online = findOneUser.is_online;
                    return user;
                }));
                isFilled =true;
                return {allUsers:allUsers,room:findRoom,isFilled:isFilled};
            }
        }else{
            return {code:3};
        }
    }catch(err){
        console.log(err);
        return err;
    }
}

let leaveRoom = async (data)=>{
    try{
        let findRoom = await socketRooms.findOne({ where: {room_id:data.room_id}});
        let isCreator = false;
        if(findRoom.created_by == data.user_id){
            let deleteRoom = await socketRooms.destroy({ where: {room_id:data.room_id}});
            console.log(deleteRoom);
            // let updateUser = await socketUsers.update({room_id:null},{ where: {user_id:data.user_id}}); 
            // console.log(updateUser);
            let allUsers = await socketUsers.findAll({ where: {room_id:data.room_id}});
            let modyfyUsers = await Promise.all(allUsers.map(async (user)=>{
                await socketUsers.update({room_id:null},{ where: {user_id:user.user_id}});
                let findOneUser = await users.findOne({ where: {fb_id:user.user_id}});
                user.dataValues.user_name = findOneUser.user_name;
                user.dataValues.room_id = null;
                //user.dataValues.is_online = findOneUser.is_online;
                return user;
            }))
            isCreator = true;
            let responseObj = {
                isCreator:isCreator,
                allUsers:modyfyUsers
            }
            return responseObj;
        }else{
            let updateUser = await socketUsers.update({room_id:null},{ where: {user_id:data.user_id}});
            findRoom.player_count-=1;
            let updateRoom = await socketRooms.update({player_count:findRoom.player_count},{ where: {room_id:data.room_id}}); 
            console.log(updateUser);
            console.log(updateRoom);
            let allUsers = await socketUsers.findAll({ where: {room_id:data.room_id}});
            allUsers =await Promise.all(allUsers.map(async (user)=>{
                let findOneUser = await users.findOne({ where: {fb_id:user.user_id}});
                user.dataValues.user_name = findOneUser.user_name;
                //user.dataValues.is_online = findOneUser.is_online;
                return user;
            }));
            let responseObj = {
                isCreator:isCreator,
                allUsers:allUsers,
                room:findRoom
            }
            return responseObj;
        }
    }catch(err){
        return null;
    }
}

let kickUser = async (data)=>{
    try{
        let findRoom = await socketRooms.findOne({ where: {room_id:data.room_id}});
        if(findRoom.created_by == data.user_id){
            let updateUser = await socketUsers.update({room_id:null},{ where: {user_id:data.kicked_user}}); 
            console.log(updateUser);
            findRoom.player_count-=1;
            let updateRoom = await socketRooms.update({player_count:findRoom.player_count},{ where: {room_id:data.room_id}});
            console.log(updateRoom);
            let allUsers = await socketUsers.findAll({ where: {room_id:data.room_id}});
            allUsers =await Promise.all(allUsers.map(async (user)=>{
                let findOneUser = await users.findOne({ where: {fb_id:user.user_id}});
                user.dataValues.user_name = findOneUser.user_name;
                //user.dataValues.is_online = findOneUser.is_online;
                return user;
            }));
            return {allUsers:allUsers,room:findRoom};
        }else{
            return null;
        }
    }catch(err){
        return null;
    }
}

let AuthCheck = async (token)=>{
    try{
        let authDetails = await Auth.findOne({ where: {auth_token:token}});
        if(check.isEmpty(authDetails) == true){
            return {isAuthorized:false};
        }else{
            let AuthCheckRes = {};
            tokenLib.verifyToken(authDetails.auth_token,authDetails.token_secret,(err,decoded)=>{
                if(err){
                    //Promise.reject({isAuthorized:false})
                    AuthCheckRes.isAuthorized = false;
                }
                else{                
                    // let AuthCheckRes = {isAuthorized:false,userId: decoded.data.fb_id}
                    // //Promise.resolve(AuthCheckRes);
                    // return Promise.resolve(AuthCheckRes);
                    AuthCheckRes.isAuthorized = true;
                    AuthCheckRes.userId = decoded.data.fb_id;
                    AuthCheckRes.user_name = decoded.data.user_name;
                }
            });
            return AuthCheckRes;
        }
    }catch(err){
        return {isAuthorized:false};
    }
}

let createInvitationEntry = async (data)=>{
    try{
        let invitationEntry = await invitationDetails.create(data);
        return invitationEntry;

    }catch(err){
        return null;
    }
}

let getAllSocketUserinRoom = async (data)=>{
    try{
        let allUsers = await socketUsers.findAll({ where: {room_id:data.room_id}});
        let findRoom = await socketRooms.findOne({ where: {room_id:data.room_id}});
        
        if(findRoom && findRoom.room_id){
            allUsers =await Promise.all(allUsers.map(async (user)=>{
                let findOneUser = await users.findOne({ where: {fb_id:user.user_id}});
                user.dataValues.user_name = findOneUser.user_name;
                //user.dataValues.is_online = findOneUser.is_online;
                return user;
            }));
            return {allUsers:allUsers,room:findRoom}; 
        } else{
            return {code:3};
        }
    }catch(err){
        return err;
    }
}
let gameRoomReadyState = async (data)=>{
    try{
        let allUsers = await socketUsers.findAll({ where: {room_id:data.room_id}});
        let findRoom = await socketRooms.findOne({ where: {room_id:data.room_id}});
        let allOnlineUsers = [];
        let allOfflineUsers = [];
        if(findRoom && findRoom.created_by == data.user_id){
            allUsers = await Promise.all(allUsers.map(async (user)=>{
                if(user.is_online == 1){
                    let findOneUser = await users.findOne({ where: {fb_id:user.user_id}});
                    user.dataValues.user_name = findOneUser.user_name;
                    allOnlineUsers.push(user);
                }else{
                    let findOneUser = await users.findOne({ where: {fb_id:user.user_id}});
                    user.dataValues.user_name = findOneUser.user_name;
                    allOfflineUsers.push(user);
                }
            }))

            return {allOnlineUsers:allOnlineUsers,allOfflineUsers:allOfflineUsers};
        }else{
            return null;
        }
    }catch(err){
        return err;
    }
}


module.exports = {
    createUser:createUser,
    createRoom:createRoom,
    getUserSocketById:getUserSocketById,
    joinRoom:joinRoom,
    AuthCheck:AuthCheck,
    createInvitationEntry:createInvitationEntry,
    leaveRoom:leaveRoom,
    kickUser:kickUser,
    getAllSocketUserinRoom:getAllSocketUserinRoom,
    updateUserOnlineStatus:updateUserOnlineStatus,
    gameRoomReadyState:gameRoomReadyState
}