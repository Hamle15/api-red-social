const express = require("express");
const router = express.Router();
//We load the controller to use
const UserController = require("../controllers/user");

//Define Routers
router.get("/test-user", UserController.pruebaUsers);
router.post("/register", UserController.register),

module.exports = router;