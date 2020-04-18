const router = require("express").Router();
const EventRouter = require("./event");
const TagRouter = require("./tag");
const AttendeeRouter = require("./attendee");
const EventTagRouter = require("./eventtag");
const UserController = require("../controllers/UserController");
const authentication = require("../middlewares/authentication");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/users", UserController.findAll);

router.use(authentication);
router.use("/events", EventRouter);
router.use("/tags", TagRouter);
router.use("/", AttendeeRouter);
router.use("/", EventTagRouter);

module.exports = router;
