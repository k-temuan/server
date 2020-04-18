const router = require("express").Router();
const EventController = require("../controllers/EventController");
const authorization = require("../middlewares/authorization");
const upload = require("../middlewares/multer");

router.get("/", EventController.findAll);
router.get("/:id", EventController.findById);
router.post("/:id/join", EventController.joinEvent);
router.post("/", upload.single("image"), EventController.create);
router.patch(
  "/:id",
  authorization,
  upload.single("image"),
  EventController.update
);
router.delete("/:id", authorization, EventController.delete);

module.exports = router;
