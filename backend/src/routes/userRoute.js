const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const upload = require("../middleware/uploadMiddleware.js");

router.patch("/preference", authMiddleware, userController.updatePreference);
router.patch("/upload-profile", authMiddleware, upload.single("profilePicture"), userController.uploadProfilePicture);

module.exports = router;
