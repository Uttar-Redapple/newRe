const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    //login route
    app.post(`${baseUrl}/login`, userController.loginFunction);

    //user data routes
    app.get(`${baseUrl}/getUserXp`,auth.isAuthorized,userController.getUserXP);
    app.put(`${baseUrl}/updateUserXp`,auth.isAuthorized,userController.updateUserXP);


    app.get(`${baseUrl}/getUserMissionData`,auth.isAuthorized,userController.getUserMissionData);
    app.put(`${baseUrl}/updateUserMissionData`,auth.isAuthorized,userController.updateUserMissionData);


    app.get(`${baseUrl}/getUserAchievementData`,auth.isAuthorized,userController.getUserAchievementData);
    app.put(`${baseUrl}/updateUserAchievementData`,auth.isAuthorized,userController.updateUserAchievementData);

    app.get(`${baseUrl}/getUserCoinValue`,auth.isAuthorized,userController.getUserCoinValue);
    app.put(`${baseUrl}/updateUserCoinValue`,auth.isAuthorized,userController.updateUserCoinValue);

    app.get(`${baseUrl}/getLeaderBoard`,auth.isAuthorized,userController.getLeaderBoard);


}
