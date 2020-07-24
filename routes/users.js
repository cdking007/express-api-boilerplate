const express = require("express");
const userController = require("../controllers/users");
const auth = require("../middlewares/auth");
const { isAdmin, isCurrentUser } = require("../middlewares/rolesAuth");

const router = express.Router();

router.get("/users", auth, isAdmin, userController.getUsers);
router.get("/users/:id", auth, isCurrentUser, userController.getUserById);
router.patch("/users/:id", auth, isCurrentUser, userController.patchUserUpdate);

module.exports = router;
