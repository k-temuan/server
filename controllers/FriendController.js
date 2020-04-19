// import from local files
const { Friend, User } = require("../models");

class FriendController {
  static create(req, res, next) {
    let { id } = req.decoded;
    let { FriendId } = req.body;
    Friend.create({
      UserId: id,
      FriendId,
    })
      .then((result) => {
        res.status(201).json({
          message: "Successfully created a new Friend",
          data: result,
        });
      })
      .catch(next);
  }

  static findAll(req, res, next) {
    let { id } = req.decoded;
    Friend.findAll({
      where: {
        UserId: id,
      },
      include: [
        {
          model: User,
          required: false,
          where: { id },
        },
        {
          model: User,
          as: "friend",
          required: false,
        },
      ],
    })
      .then((result) => {
        res.status(200).json({
          message: "Successfully fetched friends data",
          data: result,
        });
      })
      .catch(next);
  }

  static request(req, res, next) {
    // id is the one that did the friend request first
    let { id } = req.decoded;
    // FriendId is the one that is requested for a friendship
    let { FriendId } = req.body;
    Friend.create({
      UserId: id,
      FriendId,
      status: "pending",
    })
      .then((result) => {
        res.status(201).json({
          message: "Friend request sent",
          data: result,
        });
      })
      .catch(next);
  }

  static getRequest(req, res, next) {
    let { id } = req.decoded;
    let filtered = null;
    // obtain raw data
    Friend.findAll({
      where: {
        FriendId: id,
      },
      include: [
        {
          model: User,
          required: false,
        },
        {
          model: User,
          as: "friend",
          required: false,
        },
      ],
    })
      .then((result) => {
        // filter based on status
        filtered = result.filter(({ status }) => status === "pending");
        res.status(200).json({
          message: "Successfully fetched friends data",
          data: filtered,
        });
      })
      .catch(next);
  }

  static approve(req, res, next) {
    // FriendId / id = the user that is friend requested
    let { id } = req.decoded;
    // UserId = the user that initiate the friend request
    let { UserId } = req.body;
    // update the friend table
    Friend.update(
      {
        status: "accepted",
      },
      {
        where: {
          UserId,
          FriendId: id,
        },
      }
    )
      .then(() => {
        // also add a new row for the other person
        return Friend.create({
          UserId: id,
          FriendId: UserId,
          status: "accepted",
        });
      })
      .then((result) => {
        res.status(201).json({
          message: "Friend request accepted",
          data: result,
        });
      })
      .catch(next);
  }

  static getApprove(req, res, next) {
    let { id } = req.body;
    let filtered = null;
    // obtain raw data
    Friend.findAll({
      where: {
        FriendId: id,
      },
      include: [
        {
          model: User,
          required: false,
        },
        {
          model: User,
          as: "friend",
          required: false,
        },
      ],
    })
      .then((result) => {
        // filter based on status
        filtered = result.filter(({ status }) => status === "accepted");
        res.status(200).json({
          message: "Successfully fetched friends data",
          data: filtered,
        });
      })
      .catch(next);
  }

  static reject(req, res, next) {
    // FriendId = the user that is friend requested
    let { id } = req.decoded;
    // UserId = the user that initiate the friend request
    let { UserId } = req.body;
    Friend.findOne({
      where: {
        UserId,
        FriendId: id,
      },
    })
      .then((data) => {
        // Check whether the friendship status is pending or not
        if (data.status === "pending") {
          return Friend.destroy({
            where: {
              UserId,
              FriendId: id,
            },
          });
        } else {
          return {
            failed: true,
          };
        }
      })
      .then(({ failed }) => {
        if (failed) {
          next({
            name: "custom",
            message: "Cannot reject accepted friend request",
            status: 400,
          });
        } else {
          res.status(200).json({
            message: "Friend request rejected",
          });
        }
      })
      .catch(next);
  }
}

module.exports = FriendController;
