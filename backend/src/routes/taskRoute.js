const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/taskController.js");
const AuthMiddleware = require("../middleware/authMiddleware.js");

router.post("/", AuthMiddleware,  TaskController.createTask);
router.get("/", AuthMiddleware, TaskController.getTasks);
router.get("/archive", AuthMiddleware, TaskController.getTaskArchive);
router.post("/archive/:id/repeat", AuthMiddleware, TaskController.repeatTaskArchiveEntry);
router.delete("/archive/:id", AuthMiddleware, TaskController.deleteTaskArchiveEntry);
router.get("/review", AuthMiddleware, TaskController.getRepeatReview);

router.put("/reorder", AuthMiddleware, TaskController.reorderTasks);
router.patch("/:id/complete", AuthMiddleware, TaskController.markComplete);

router.put("/:id", AuthMiddleware, TaskController.updateTask);
router.post("/repeat", AuthMiddleware, TaskController.repeatTasks);
router.delete("/:id", AuthMiddleware, TaskController.deleteTask);

module.exports = router;
