const express = require("express");
const router = express.Router();
//We load the controller to use
const PublicationController = require("../controllers/publication");
const check = require("../middleware/auth");

//Define Routers
router.get("/test-publication", PublicationController.testPublication);
router.post("/save", check.auth, PublicationController.save);
router.get("/detail/:id", check.auth, PublicationController.detail);
router.delete("/remove/:id", check.auth, PublicationController.remove);
router.get("/user/:id/page", check.auth, PublicationController.user);
module.exports = router;
