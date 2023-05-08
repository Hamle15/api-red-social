const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow");
const check = require("../middleware/auth");

//Define Routers
router.get("/test-follow", FollowController.testFollow);
router.post("/save", check.auth, FollowController.save);

module.exports = router;
