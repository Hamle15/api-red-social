const express = require("express");
const router = express.Router();
const multer = require("multer");
//We load the controller to use
const UserController = require("../controllers/user");
const check = require("../middleware/auth");

//Confinf of upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/avatars");
  },

  filename: (req, file, cb) => {
    cb(null, "avatar-" + Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage });

//Define Routers
router.get("/test-user", check.auth, UserController.pruebaUsers);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", check.auth, UserController.profile);
router.get("/list/:page?", check.auth, UserController.list);
router.put("/update", check.auth, UserController.update);
router.post(
  "/upload",
  [check.auth, uploads.single("file0")],
  UserController.upload
);
router.get("/avatar/:file", check.auth, UserController.avatar);

module.exports = router;
