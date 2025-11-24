const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware.js");

const {
    createDailyPlanEntry,
    getDailyPlan,
    editDailyPlan,
    updatePlanTime,
    deletePlan,
    copyDailyPlan,
    markDayComplete
} = require("../controllers/dailyPlanController.js");

router.post("/create", auth, createDailyPlanEntry);
router.get("/:date", auth, getDailyPlan);
router.put("/edit/:date/:planId", auth, editDailyPlan);
router.put("/time/:date/:planId", auth, updatePlanTime);
router.delete("/:date/:planId", auth, deletePlan);
router.post("/copy", auth, copyDailyPlan);
router.post("/complete", auth, markDayComplete);

module.exports = router;