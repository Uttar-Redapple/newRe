var schema = {};

var sequelize = require('../../config/sequelize');
var Sequelize = require('sequelize');


/** MASTER TABLE DEFINATION  */

schema.userSchema =  sequelize.define('users', {    
      fb_id:{
        type:Sequelize.STRING,
        primaryKey:true
      },
      user_name:{
        type:Sequelize.STRING
      },
      img_url:{
        type:Sequelize.STRING
      },
      created_at: {
        type: Sequelize.DATE
      }
},{
    tableName: 'users',
    "timestamps": false,
    "underscored": true
}); 

schema.sessionTokenSchema =  sequelize.define('user_session', {     
      fb_id: {
        type:Sequelize.STRING,
        primaryKey:true
      },
      auth_token: {
        type:Sequelize.STRING
      },
      token_secret: {
        type:Sequelize.STRING
      },
      token_generation_time: {
        type: Sequelize.DATE
      }
},{
  tableName: 'user_session',
  "timestamps": false,
  "underscored": true
}); 

schema.userXP =  sequelize.define('userxp', {    
  fb_id:{
    type:Sequelize.STRING,
    primaryKey:true
  },
  xp_value:{
    type:Sequelize.INTEGER
  }
},{
tableName: 'userxp',
"timestamps": false,
"underscored": true
}); 

schema.userMissions =  sequelize.define('missions', {    
  fb_id:{
    type:Sequelize.STRING,
    primaryKey:true
  },
  mission_value:{
    type:Sequelize.INTEGER
  }
},{
tableName: 'missions',
"timestamps": false,
"underscored": true
});

schema.userAchievements =  sequelize.define('achievements', {    
  fb_id:{
    type:Sequelize.STRING,
    primaryKey:true
  },
  achievements:{
    type:Sequelize.STRING
  }
},{
tableName: 'achievements',
"timestamps": false,
"underscored": true
});

schema.socketUsers =  sequelize.define('socket_users', {    
  user_id:{
    type:Sequelize.STRING,
    primaryKey:true
  },
  socket_id:{
    type:Sequelize.STRING
  },
  room_id:{
    type:Sequelize.STRING
  },
  is_online:{
    type:Sequelize.INTEGER
  }
},{
tableName: 'socket_users',
"timestamps": false,
"underscored": true
});

schema.socketRooms =  sequelize.define('socket_rooms', {    
  room_id:{
    type:Sequelize.STRING,
    primaryKey:true
  },
  room_name:{
    type:Sequelize.STRING
  },
  room_key:{
    type:Sequelize.STRING
  },
  created_by:{
    type:Sequelize.STRING
  },
  player_count:{
    type:Sequelize.INTEGER
  }
},{
tableName: 'socket_rooms',
"timestamps": false,
"underscored": true
});

schema.userCoinValue =  sequelize.define('coin_value', {    
  fb_id:{
    type:Sequelize.STRING,
    primaryKey:true
  },
  coin_value:{
    type:Sequelize.INTEGER
  }
},{
tableName: 'coin_value',
"timestamps": false,
"underscored": true
}); 

schema.invitationDetails =  sequelize.define('invitation_detail', {    
  room_id:{
    type:Sequelize.STRING,
    primaryKey:true
  },
  sender_id:{
    type:Sequelize.STRING
  },
  receiver_id:{
    type:Sequelize.STRING
  }
},{
tableName: 'invitation_detail',
"timestamps": false,
"underscored": true
});


module.exports  = schema;