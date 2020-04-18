const router = require("express").Router();
const TagController = require("../controllers/TagController");
const authorization = require("../middlewares/authorization");

router.get("/", TagController.findAll);
router.get("/:id", TagController.findById);
router.post("/", TagController.create);
router.patch("/:id", authorization, TagController.update);
router.delete("/:id", authorization, TagController.delete);

module.exports = router;
