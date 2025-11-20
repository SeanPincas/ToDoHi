const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/taskController.js");
const AuthMiddleware = require("../middleware/authMiddleware.js");

router.post("/", AuthMiddleware,  TaskController.createTask);
router.get("/", AuthMiddleware, TaskController.getTasks);
router.put("/:id", AuthMiddleware, TaskController.updateTask);
router.delete("/:id", AuthMiddleware, TaskController.deleteTask);
router.patch("/:id/complete", AuthMiddleware, TaskController.markComplete);
router.put("/reorder", AuthMiddleware, TaskController.reorderTasks);
router.post("/auto-fail", AuthMiddleware, TaskController.autoFailTasks);

module.exports = router;