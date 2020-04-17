const router = require("express").Router();
const EventController = require("../controllers/EventController");
const authorization = require("../middlewares/authorization");

router.get("/", EventController.findAll);
router.get("/:id", EventController.findById);
router.post("/:id/join", EventController.joinEvent);
router.post("/", EventController.create);
router.patch("/:id", authorization, EventController.update);
router.delete("/:id", authorization, EventController.delete);

module.exports = router;
