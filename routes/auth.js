const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();

router.post("/signup", authController.postSignup);
router.post("/login", authController.postLogin);
router.post("/reset-password", authController.postPasswordReset);
router.get("/reset-password-verify", authController.getTokenPasswordVerify);
router.post("/reset-password-new-set", authController.postPasswordResetNewSet);

module.exports = router;
