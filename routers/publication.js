const express = require("express");
const router = express.Router();
//We load the controller to use
const PublicationController = require("../controllers/publication");
const check = require("../middleware/auth");

//Define Routers
router.get("/test-publication", PublicationController.testPublication);
router.post("/save", check.auth, PublicationController.save);
module.exports = router;
