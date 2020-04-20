// import from node_modules
const router = require("express").Router();

// import from controllers folder
const EventController = require("../controllers/EventController");

// import from middlewares folder
const authorization = require("../middlewares/authorization");
const upload = require("../middlewares/multer");

// main
router.get("/", EventController.findAll);
router.get("/:id", EventController.findById);
router.post("/", upload.single("image"), EventController.create);
router.patch(
  "/:id",
  authorization,
  upload.single("image"),
  EventController.update
);
router.delete("/:id", authorization, EventController.delete);

module.exports = router;
