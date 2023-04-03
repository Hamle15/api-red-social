const express = require("express");
const router = express.Router();
//We load the controller to use
const FollowController = require("../controllers/follow");

//Define Routers
router.get("/test-follow", FollowController.testFollow);

module.exports = router;