const express = require("express");
const router = express.Router();
const memoController = require("../controllers/memoController.js");
const authMiddleware = require("../middleware/authMiddleware.js");

router.post("/", authMiddleware, memoController.createMemo);
router.post("/from-task", authMiddleware, memoController.createMemoFromTask);
router.get("/", authMiddleware, memoController.getAllMemos);
router.put("/:id", authMiddleware, memoController.updateMemo);
router.put("/:id/position", authMiddleware, memoController.updateMemoPosition);
router.delete("/:id", authMiddleware, memoController.deleteMemo);

module.exports = router;