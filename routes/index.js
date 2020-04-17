const router = require("express").Router();
const EventRouter = require("./event");
const UserController = require("../controllers/UserController");
const authentication = require("../middlewares/authentication");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/users", UserController.findAll);

router.use(authentication);
router.use("/events", EventRouter);

module.exports = router;
