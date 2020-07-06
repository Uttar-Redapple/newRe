let appConfig = {};

appConfig.restfulport = 8181;
appConfig.socketport = 8080;
appConfig.allowedCorsOrigin = "*";
appConfig.env = process.env.NODE_ENV || "stg";
appConfig.apiVersion = '/api/v1';
appConfig.jwtTokenSecret = 'redApple_#$@@1729_gangwar##secretKey@';
appConfig.MAXroomLimit = 10;
appConfig.MAXleaderBoardCount = 20;


module.exports = {
    restfulport: appConfig.restfulport,
    socketport:appConfig.socketport,
    allowedCorsOrigin: appConfig.allowedCorsOrigin,
    environment: appConfig.env,
    apiVersion : appConfig.apiVersion,
    jwtTokenSecret:appConfig.jwtTokenSecret,
    MAXroomLimit:appConfig.MAXroomLimit,
    MAXleaderBoardCount:appConfig.MAXleaderBoardCount
};