// import from node_modules
const router = require("express").Router();

// import from local files
const NotificationController = require("../controllers/NotificationController");

// main
router.get("/", NotificationController.findAll);
router.get("/:id",NotificationController.findById);
router.post("/", NotificationController.create);
router.patch("/:id", NotificationController.update);
router.delete("/:id", NotificationController.delete);

module.exports = router;
