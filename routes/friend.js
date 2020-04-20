// import from node_modules
const router = require("express").Router();

// import from controllers folder
const FriendController = require("../controllers/FriendController");

// import from middlewares folder
const {
  FriendIdAuthentificator,
  UserIdAuthentificator,
} = require("../middlewares/friendAuthentication");

// main
router.post(
  "/request/:FriendId",
  FriendIdAuthentificator,
  FriendController.request
);
router.get("/request", FriendController.getRequest);
router.post(
  "/approve/:UserId",
  UserIdAuthentificator,
  FriendController.approve
);
router.get("/approve", FriendController.getApprove);
router.post("/reject/:UserId", UserIdAuthentificator, FriendController.reject);
router.post("/:FriendId", FriendIdAuthentificator, FriendController.create);
router.get("/", FriendController.findAll);

module.exports = router;
