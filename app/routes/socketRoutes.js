const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const socketController = require("./../../app/controllers/socketController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.get(`${baseUrl}/getUserRoomDetails`,auth.isAuthorized,socketController.getUserRoomDetails);
    app.get(`${baseUrl}/getInvitationDetails`,auth.isAuthorized,socketController.getInvitationDetails);

    app.post(`${baseUrl}/joinRoomByAccessKey`,auth.isAuthorized,socketController.joinRoomByAccessKey);

}
