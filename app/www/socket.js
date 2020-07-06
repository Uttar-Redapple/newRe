/**
 * modules dependencies.
 */
const socketio = require('socket.io');
const mongoose = require('mongoose');
const shortid = require('shortid');
const logger = require('../libs/loggerLib');
const events = require('events');
const eventEmitter = new events.EventEmitter();

const tokenLib = require("../libs/tokenLib");
const check = require("../libs/checkLib");
const response = require('../libs/responseLib');
const appConfig = require('../../config/appConfig');

const socketLib = require('../libs/socketLib');


let setServer =(server) => {

    //let allOnlineUsers = []

    let io = socketio.listen(server);

    let gwIo = io.of('/gangwar')

    gwIo.on('connection',(socket) => {

        console.log("on connection--emitting verify user");
        //let isAuthorized = false;
        let socketResponse = response.generate(1,'connection successfull-set user with token',null)
        socket.emit("verifyuser", socketResponse);

        // code to verify the user and make him online

        socket.on('setuser',(authToken) => {

            console.log("setuser called")

            socketLib.AuthCheck(authToken.authtoken).then((details)=>{
                if(details.isAuthorized == true){
                    console.log("user is verified..setting details");
                    let userObj = {
                        user_id:details.userId,
                        socket_id:socket.conn.id,
                        socket:socket,
                        is_online:1
                    }
                    socketLib.createUser(userObj).then((resp)=>{
                        console.log(resp);
                        if(resp.room){
                            let roomObj = resp.room;
                            socket.join(roomObj.room_name);
                            roomObj.dataValues.joinedUsers = resp.allUsers;
                            let socketResponse = response.generate(1,'new user joined room',roomObj);
                            gwIo.to(roomObj.room_name).emit('room_details',socketResponse);
                        }
                        let socketResponse = response.generate(1,'authentication successfull',null);
                        socket.emit("authConf",socketResponse);
                    });
                }else if(details.isAuthorized == false){
                    let socketResponse = response.generate(0,'invalid or expired token-unable to authorize',{code:2});
                    socket.emit("authConf",socketResponse);
                }
            }).catch((err)=>{
                console.log(err);
            });
          
        }) // end of listening set-user event


        socket.on('create_room',(data)=>{
            try{

                socketLib.AuthCheck(data.authtoken).then((authres)=>{
                    if(authres.isAuthorized == true){
                        let roomObj = {
                            room_id:shortid.generate(),
                            room_name:shortid.generate(),
                            room_key:shortid.generate(),
                            created_by:authres.userId,
                            player_count:1
                        }
                        socketLib.createRoom(roomObj).then((allUsers)=>{
                            if(allUsers.room){
                                let roomObj = allUsers.room;
                                roomObj.dataValues.joinedUsers = allUsers.allUsers;
                                let socketResponse = response.generate(1,'already in a room',roomObj);
                                socket.emit('room_details',socketResponse);
                            }else{
                                if(allUsers.isExist == undefined || null){
                                    console.log(allUsers.allUsers);
                                    //socket.room = data.room_name;
                                    socket.join(roomObj.room_name);
                                    roomObj.joinedUsers = allUsers.allUsers;
                                    let socketResponse = response.generate(1,'room created',roomObj);
                                    socket.emit('room_details',socketResponse);
                                }else{
                                    console.log(allUsers.allUsers);
                                    //socket.room = data.room_name;
                                    socket.join(roomObj.room_name);
                                    allUsers.isExist.joinedUsers = allUsers.allUsers;
                                    let socketResponse = response.generate(1,'room created',allUsers.isExist);
                                    socket.emit('room_details',socketResponse);
                                }
                            }
 
                        });
                    }else{
                        let socketResponse = response.generate(0,'invalid or expired token-unable to authorize',{code:2});
                        socket.emit('room_details',socketResponse);
                    }

                })
            }catch(err){
                console.log(err);
            }
        })

        socket.on('invite_user',(data)=>{
            try{
                socketLib.AuthCheck(data.authtoken).then((authres)=>{
                    if(authres.isAuthorized == true){
                        let inviteObj = {
                            room_id:data.room_id,
                            room_name:data.room_name,
                            room_key:data.room_key,
                            sender_id:data.sender_id,
                            sender_name:authres.user_name
                        }
                        let inviteEntryObj = {
                            room_id:data.room_id,
                            sender_id:data.sender_id,
                            receiver_id:data.receiver_id
                        }

                        socketLib.createInvitationEntry(inviteEntryObj).then((resp)=>{
                            socketLib.getUserSocketById(resp.receiver_id).then((userSocketId)=>{
                                if(userSocketId.room_id == null){
                                    let socketResponse = response.generate(1,'game invitation received',inviteObj);
                                    let socketId = '/gangwar#'+userSocketId.socket_id;
                                    gwIo.to(socketId).emit('game_invitation',socketResponse);
                                    socketResponse = response.generate(1,'user invited successfully',null);
                                    socket.emit('invite_confirm',socketResponse);
                                }else {
                                    let socketResponse = response.generate(0,'user already joined another room',null);
                                    socket.emit('invite_confirm',socketResponse);
                                }
                            })
                        })
        
                    }else{
                        let socketResponse = response.generate(0,'invalid or expired token-unable to authorize',{code:2});
                        socket.emit("authConf",socketResponse);                       
                    }
                });          
            }catch(err){
                console.log(err);
            }
        })

        socket.on('accept_invitation',(data)=>{
            try{
                socketLib.AuthCheck(data.authtoken).then((authres)=>{
                    if(authres.isAuthorized == true){
                        socketLib.joinRoom(data).then((resp)=>{
                            if(resp && resp.room){
                                if(resp.isFilled == true){
                                    let roomObj = resp.room;
                                    roomObj.dataValues.joinedUsers = resp.allUsers;
                                    let socketResponse = response.generate(0,'can not join-room is full',roomObj);
                                    socket.emit('room_details',socketResponse);
                                }else{
                                    let roomObj = resp.room;
                                    socket.join(data.room_name);
                                    roomObj.dataValues.joinedUsers = resp.allUsers;
                                    let socketResponse = response.generate(1,'new user joined room',roomObj);
                                    gwIo.to(data.room_name).emit('room_details',socketResponse);
                                }
                            }else if(resp.code && resp.code == 3){
                                let socketResponse = response.generate(0,'Room destroyed',resp);
                                socket.emit('room_details',socketResponse);
                            }
                        })
                    }else{
                        let socketResponse = response.generate(0,'invalid or expired token-unable to authorize',{code:2});
                        socket.emit("authConf",socketResponse);
                    }
                })
            }catch(err){}
        })

        socket.on('decline_invitation',(data)=>{
            try{
                socketLib.AuthCheck(data.authtoken).then((authres)=>{
                    if(authres.isAuthorized == true){
                        socketLib.getAllSocketUserinRoom(data).then((resp)=>{
                            if(resp.code && resp.code == 3){
                                let socketResponse = response.generate(0,'decline failed as Room destroyed',resp);
                                socket.emit('decline_confirm',socketResponse);
                            }else{
                                let roomObj = resp.room;
                                roomObj.dataValues.joinedUsers = resp.allUsers;
                                let socketResponse = response.generate(1,'declined request successfully',null);
                                socket.emit('decline_confirm',socketResponse);
                                // socketResponse = response.generate(1,'one user declined joining request',roomObj);
                                // gwIo.in(data.room_name).emit('room_details',socketResponse);

                            }
                        })
                   }else{
                        let socketResponse = response.generate(0,'invalid or expired token-unable to authorize',{code:2});
                        socket.emit("authConf",socketResponse);
                    }
                })
            }catch(err){}
        })

        socket.on('leave_room',(data)=>{
            try{
                socketLib.AuthCheck(data.authtoken).then((authres)=>{
                    if(authres.isAuthorized == true){
                        socketLib.leaveRoom(data).then((resp)=>{
                            if(resp.isCreator == true){
                                let allUsers = resp.allUsers;
                                console.log(allUsers);
                                gwIo.in(data.room_name).emit('room_destroyed',{room_name:data.room_name,room_id:data.room_id});
                                setTimeout(() => {
                                    allUsers.map((user)=>{
                                        let socket_user = io.sockets.connected[user.socket_id];
                                        socket_user.leave(data.room_name);
                                    })
                                }, 1000);
                            }else{
                                socket.leave(data.room_name);
                                let roomObj = resp.room;
                                roomObj.dataValues.joinedUsers = resp.allUsers;
                                let socketResponse = response.generate(1,`user ${data.user_id} left room`,roomObj);
                                gwIo.in(data.room_name).emit('room_details',socketResponse);
                                socket.emit('leave_success',response.generate(1,'successfully left room',{room_name:data.room_name,room_id:data.room_id}));
                            }
                        })
                    }else{
                        let socketResponse = response.generate(0,'invalid or expired token-unable to authorize',{code:2});
                        socket.emit("authConf",socketResponse);
                    }
                })
            }catch(err){
                console.log(`error:${err}`);
            }
        })

        socket.on('kick_user',(data)=>{
            try{
                socketLib.AuthCheck(data.authtoken).then((authres=>{
                    if(authres.isAuthorized == true){
                        socketLib.kickUser(data).then((resp)=>{
                            if(resp == null){
                                let socketResponse = response.generate(0,'elevated right required to kick user',null);
                                socket.emit('kicked_user',socketResponse);
                            }else{
                                socketLib.getUserSocketById(data.kicked_user).then((userSocketId)=>{
                                    //let socket_user = io.sockets.connected[userSocketId.socket_id];
                                    if(userSocketId.is_online == 1){
                                        let socketId = '/gangwar#'+userSocketId.socket_id;
                                        gwIo.connected[socketId].leave(data.room_name);
                                        let socketResponse = response.generate(1,'you have been kicked out from room',null);
                                        gwIo.to(socketId).emit('kicked_out',socketResponse);
                                    }
                                    let roomObj = resp.room;
                                    roomObj.dataValues.joinedUsers = resp.allUsers;
                                    socketResponse = response.generate(1,'one user kicked out from room',roomObj);
                                    setTimeout(() => {
                                        gwIo.in(data.room_name).emit('room_details',socketResponse);
                                    }, 1000);
                                })
                            }
                        })
                    }else{
                        let socketResponse = response.generate(0,'invalid or expired token-unable to authorize',{code:2});
                        socket.emit("authConf",socketResponse);
                    }
                }))
            }catch(err){
                console.log(err);
            }
        })


        socket.on('start_game',(data)=>{
            try{
                socketLib.AuthCheck(data.authtoken).then((authres)=>{
                    if(authres.isAuthorized == true){
                        let roomStateObj = data;
                        data.user_id = authres.userId;
                        socketLib.gameRoomReadyState(roomStateObj).then((resp)=>{
                            if(resp && resp.allOfflineUsers.length>0){
                                let socketResponse = response.generate(1,'There are offline users in room',resp.allOfflineUsers);
                                gwIo.in(data.room_name).emit('user_offline',socketResponse);
                            }else if(resp == null){
                                let socketResponse = response.generate(0,'need elevated access to start game',null);
                                socket.emit('game_started',socketResponse);
                            }else{
                                let socketResponse = response.generate(1,'game started',resp.allOnlineUsers);
                                gwIo.in(data.room_name).emit('game_started',socketResponse);
                            }
                        })
                    }else{
                        let socketResponse = response.generate(0,'invalid or expired token-unable to authorize',{code:2});
                        socket.emit("authConf",socketResponse);
                    }
                })
            }catch(err){
                console.log(err);
            }
        })
        socket.on('disconnect', () => {
            // disconnect the user from socket
            // remove the user from online list
            // unsubscribe the user from his own channel

            console.log("user is disconnected");
            let updateObj = {
                socket_id:socket.conn.id,
                is_online:0
            } 
            socketLib.updateUserOnlineStatus(updateObj).then((resp)=>{
                if(resp){
                    console.log('one user disconnected');
                }else{
                    console.log('user not found..could not update status');
                }
            })
            // console.log(socket.connectorName);
            //console.log(socket.userId);


            // var removeIndex = allOnlineUsers.map(function(user) { return user.userId; }).indexOf(socket.userId);
            // allOnlineUsers.splice(removeIndex,1)
            // console.log(allOnlineUsers)

            // socket.to(socket.room).broadcast.emit('online-user-list',allOnlineUsers);
            // socket.leave(socket.room)

        }) // end of on disconnect
    });

}

module.exports = {
    setServer: setServer
}
