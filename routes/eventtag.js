const router = require("express").Router();
const EventTagController = require("../controllers/EventTagController");

router.get("/", EventTagController.findAll);
router.get("/:id", EventTagController.findById);
router.post("/", EventTagController.create);
router.patch("/:id", EventTagController.update);
router.delete("/:id", EventTagController.delete);

module.exports = router;
