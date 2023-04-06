const express = require("express");
const router = express.Router();
//We load the controller to use
const UserController = require("../controllers/user");
const check = require("../middleware/auth");

//Define Routers
router.get("/test-user", check.auth, UserController.pruebaUsers);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", check.auth, UserController.profile);

module.exports = router;