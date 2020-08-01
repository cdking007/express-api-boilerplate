const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();
const auth = require("../middlewares/auth");

router.post("/signup", authController.postSignup);
router.post("/login", authController.postLogin);
router.post("/logout", auth, authController.postLogout);
router.post("/logoutall", auth, authController.postLogoutAll);
router.post("/reset-password", authController.postPasswordReset);
router.get("/reset-password-verify", authController.getTokenPasswordVerify);
router.post("/reset-password-new-set", authController.postPasswordResetNewSet);

module.exports = router;
