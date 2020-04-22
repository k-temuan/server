// import from node_modules
const router = require("express").Router();

// import from controller
const AttendeeController = require("../controllers/AttendeeController");

// main
router.post("/email/:id", AttendeeController.sendEmail);
router.get("/", AttendeeController.findAll);
router.get("/:id", AttendeeController.findById);
router.post("/", AttendeeController.create);
router.patch("/:id", AttendeeController.update);
router.delete("/:id", AttendeeController.delete);

module.exports = router;
