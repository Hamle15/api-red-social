const express = require("express");
const router = express.Router();
//We load the controller to use
const PublicationController = require("../controllers/publication");

//Define Routers
router.get("/test-publication", PublicationController.testPublication);

module.exports = router;