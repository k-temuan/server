const router = require("express").Router();
const AttendeeController = require("../controllers/AttendeeController");

router.get("/", AttendeeController.findAll);
router.get("/:id", AttendeeController.findById);
router.post("/", AttendeeController.create);
router.patch("/:id", AttendeeController.update);
router.delete("/:id", AttendeeController.delete);

module.exports = router;
