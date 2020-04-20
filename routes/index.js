// import from node_modules
const router = require("express").Router();

// import from routes folder
const EventRouter = require("./event");
const TagRouter = require("./tag");
const AttendeeRouter = require("./attendee");
const FriendRouter = require("./friend");
const NotificationRouter = require("./notification");

// import from controllers folder
const UserController = require("../controllers/UserController");

// import from middlewares folder
const authentication = require("../middlewares/authentication");

// main
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/users", UserController.findAll);

// need authentification
router.use(authentication);
router.get("/users/:id", UserController.findById);
router.use("/friends", FriendRouter);
router.use("/events", EventRouter);
router.use("/tags", TagRouter);
router.use("/attendees", AttendeeRouter);
router.use("/notifications", NotificationRouter);

module.exports = router;
