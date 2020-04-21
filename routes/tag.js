// import from node_modules
const router = require("express").Router();

// import from controllers folder
const TagController = require("../controllers/TagController");

// main
router.post("/", TagController.create);
router.patch("/:id", TagController.update);
router.delete("/:id", TagController.delete);

module.exports = router;
