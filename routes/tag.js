const router = require("express").Router();
const TagController = require("../controllers/TagController");

router.get("/", TagController.findAll);
router.get("/:id", TagController.findById);
router.post("/", TagController.create);
router.patch("/:id", TagController.update);
router.delete("/:id", TagController.delete);

module.exports = router;
