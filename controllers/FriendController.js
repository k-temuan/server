// import from local files
const { Friend, User } = require("../models");

class FriendController {
  static create(req, res, next) {
    // check first whether or not that friend request already exist
    let { id } = req.decoded;
    let { FriendId } = req.params;
    let { status } = req.body;
    Friend.findOne({
      where: {
        UserId: id,
        FriendId,
      },
    })
      .then((found) => {
        if (found) {
          // duplicate exist, throw error
          next({
            name: "custom",
            status: 400,
            message: "Friend request already sent",
          });
        } else {
          return Friend.create({
            UserId: id,
            FriendId,
            status,
          });
        }
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
    let filtered = [];
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
        // delete key to password
        result.forEach((element) => {
          let obj = {};
          obj = { ...element["dataValues"] };
          // deleting the password from include
          delete obj["User"]["dataValues"]["password"];
          delete obj["friend"]["dataValues"]["password"];
          filtered.push(obj);
        });
        res.status(200).json({
          message: "Successfully fetched friends data",
          data: filtered,
        });
      })
      .catch(next);
  }

  static request(req, res, next) {
    // id is the one that did the friend request first
    let { id } = req.decoded;
    // FriendId is the one that is requested for a friendship
    let { FriendId } = req.params;
    // check first whether there are already similar request
    Friend.findOne({
      where: {
        UserId: id,
        FriendId,
      },
    })
      .then((found) => {
        if (found) {
          // duplicate exist, throw error
          next({
            name: "custom",
            status: 400,
            message: "Friend request already sent",
          });
        } else {
          return Friend.create({
            UserId: id,
            FriendId,
            status: "pending",
          });
        }
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
    let filtered2 = [];
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
        // delete key to password
        filtered.forEach((element) => {
          let obj = {};
          obj = { ...element["dataValues"] };
          // deleting the password from include
          delete obj["User"]["dataValues"]["password"];
          delete obj["friend"]["dataValues"]["password"];
          filtered2.push(obj);
        });
        res.status(200).json({
          message: "Successfully fetched friends data",
          data: filtered2,
        });
      })
      .catch(next);
  }

  static approve(req, res, next) {
    // FriendId / id = the user that is friend requested
    let { id } = req.decoded;
    // UserId = the user that initiate the friend request
    let { UserId } = req.params;
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
    let { id } = req.decoded;
    let filtered = null;
    let filtered2 = [];
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
        // delete key to password
        filtered.forEach((element) => {
          let obj = {};
          obj = { ...element["dataValues"] };
          // deleting the password from include
          delete obj["User"]["dataValues"]["password"];
          delete obj["friend"]["dataValues"]["password"];
          filtered2.push(obj);
        });
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
    let { UserId } = req.params;
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
            data: {
              UserId,
              FriendId: String(id),
            },
          });
        }
      })
      .catch(next);
  }
}

module.exports = FriendController;
