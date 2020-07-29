const express = require('express');
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const upload = require('../../app/libs/uploadLib');
const appConfig = require("../../config/appConfig");
const auth = require('../middlewares/auth');

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.post(`${baseUrl}/uploadImage`,upload.upload.single('screenshot'),uploadController.uploadHandler);

}
