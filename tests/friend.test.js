// import from node_modules
const request = require("supertest");

// import from local
const { getToken } = require("../helpers/jwt");
const app = require("../app");
const { User, sequelize, Friend } = require("../models");
const { queryInterface } = sequelize;

// initialization and cleaning up
let user_one = {
  firstname: "Test",
  lastname: "One",
  email: "testone@gmail.com",
  password: "password1",
  photo_url:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
};
let user_two = {
  firstname: "Test",
  lastname: "Two",
  email: "testtwo@gmail.com",
  password: "password2",
  photo_url:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
};
let user_three = {
  firstname: "Test",
  lastname: "Three",
  email: "testthree@gmail.com",
  password: "password3",
  photo_url:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
};
let user_four = {
  firstname: "Test",
  lastname: "Four",
  email: "testfour@gmail.com",
  password: "password4",
  photo_url:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
};
let user_five = {
  firstname: "Test",
  lastname: "Five",
  email: "testfive@gmail.com",
  password: "password5",
  photo_url:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
};
beforeAll((done) => {
  User.create(user_one)
    .then(({ id }) => {
      user_one["id"] = id;
      user_one["access_token"] = getToken({ id });
      return User.create(user_two);
    })
    .then(({ id }) => {
      user_two["id"] = id;
      user_two["access_token"] = getToken({ id });
      return User.create(user_three);
    })
    .then(({ id }) => {
      user_three["id"] = id;
      user_three["access_token"] = getToken({ id });
      return User.create(user_four);
    })
    .then(({ id }) => {
      user_four["id"] = id;
      user_four["access_token"] = getToken({ id });
      return User.create(user_five);
    })
    .then(({ id }) => {
      user_five["id"] = id;
      user_five["access_token"] = getToken({ id });
      return Friend.create({
        UserId: user_four["id"],
        FriendId: user_five["id"],
        status: "pending",
      });
    })
    .catch(console.log)
    .finally((_) => done());
});

afterAll((done) => {
  queryInterface
    .bulkDelete("Friends", {})
    .then((_) => {
      return queryInterface.bulkDelete("Users", {});
    })
    .then((_) => {
      done();
    })
    .catch((err) => done(err));
});

// main
describe("Friend routes", () => {
  describe("GET /friends", () => {
    describe("success process", () => {
      describe("get friends", () => {
        it("should return an array of friends and status 200", (done) => {
          request(app)
            .get("/friends")
            .set("access_token", user_four["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(200);
              expect(res.body).toHaveProperty(
                "message",
                "Successfully fetched friends data"
              );
              expect(res.body).toHaveProperty("data", expect.any(Array));
              done();
            });
        });
      });
    });
    describe("error process", () => {
      describe("Unauthorized", () => {
        it("should return an error because there's no access_token in the headers and status 401", (done) => {
          request(app)
            .get("/friends")
            .end((err, res) => {
              expect(res.statusCode).toEqual(401);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("Not Authorized");
              done();
            });
        });
      });
    });
  });

  describe("POST /friends/:FriendId", () => {
    describe("success process", () => {
      describe("create a Friend", () => {
        it("should return the data of the newly created friend and status 201", (done) => {
          request(app)
            .post(`/friends/${user_two["id"]}`)
            .send({
              status: "pending",
            })
            .set("access_token", user_one["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(201);
              expect(res.body).toHaveProperty(
                "message",
                "Successfully created a new Friend"
              );
              expect(res.body.data).toHaveProperty("id", expect.any(Number));
              expect(res.body.data).toHaveProperty("UserId", user_one.id);
              expect(res.body.data).toHaveProperty("FriendId", user_two.id);
              expect(res.body.data).toHaveProperty("status", "pending");
              done();
            });
        });
      });
    });

    describe("error process", () => {
      describe("attemp to create a friend", () => {
        it("should return an error because status is not set", (done) => {
          request(app)
            .post(`/friends/${user_three["id"]}`)
            .send({
              status: "",
            })
            .set("access_token", user_one["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(400);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain(
                "Status cannot be empty",
                "Status can only have 'pending' and 'accepted' value"
              );
              done();
            });
        });
        it("should return an error because FriendId is not found", (done) => {
          request(app)
            .post(`/friends/${String(999999999)}`)
            .send({
              status: "",
            })
            .set("access_token", user_one["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(404);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("User with that id not found");
              done();
            });
        });
        it("should return an error because friend request is already sent", (done) => {
          request(app)
            .post(`/friends/${user_two["id"]}`)
            .send({
              status: "pending",
            })
            .set("access_token", user_one["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(400);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("Friend request already sent");
              done();
            });
        });
        it("should return an error because there's no access_token in the headers and status 401", (done) => {
          request(app)
            .post(`/friends/${user_two["id"]}`)
            .end((err, res) => {
              expect(res.statusCode).toEqual(401);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("Not Authorized");
              done();
            });
        });
      });
    });
  });

  describe("GET /friends/request", () => {
    describe("success process", () => {
      describe("fetch friend requests", () => {
        it("should return the data of friend request(status === pending) and status 200", (done) => {
          request(app)
            .get(`/friends/request`)
            .set("access_token", user_two["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(200);
              expect(res.body).toHaveProperty(
                "message",
                "Successfully fetched friends data"
              );
              expect(res.body).toHaveProperty("data", expect.any(Array));
              expect(res.body.data[0]).toHaveProperty("id", expect.any(Number));
              expect(res.body.data[0]).toHaveProperty("UserId", user_one.id);
              expect(res.body.data[0]).toHaveProperty("FriendId", user_two.id);
              expect(res.body.data[0]).toHaveProperty("status", "pending");
              done();
            });
        });
      });
    });

    describe("error process", () => {
      describe("attemp to fetch friend request data", () => {
        it("should return an error because there's no access_token in the headers and status 401", (done) => {
          request(app)
            .get(`/friends/${user_two["id"]}`)
            .end((err, res) => {
              expect(res.statusCode).toEqual(401);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("Not Authorized");
              done();
            });
        });
      });
    });
  });

  describe("POST /friends/request/:FriendId", () => {
    describe("success process", () => {
      describe("send friend requests", () => {
        it("should return the data of the friend request and status 201", (done) => {
          request(app)
            .post(`/friends/request/${user_three["id"]}`)
            .set("access_token", user_one["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(201);
              expect(res.body).toHaveProperty("message", "Friend request sent");
              expect(res.body.data).toHaveProperty("id", expect.any(Number));
              expect(res.body.data).toHaveProperty("UserId", user_one.id);
              expect(res.body.data).toHaveProperty("FriendId", user_three.id);
              expect(res.body.data).toHaveProperty("status", "pending");
              done();
            });
        });
      });
    });

    describe("error process", () => {
      describe("attemp to send a friend request", () => {
        it("should return an error because FriendId is not found", (done) => {
          request(app)
            .post(`/friends/request/${String(999999999)}`)
            .set("access_token", user_one["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(404);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("User with that id not found");
              done();
            });
        });
        it("should return an error because friend request is already sent", (done) => {
          request(app)
            .post(`/friends/request/${user_three["id"]}`)
            .set("access_token", user_one["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(400);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("Friend request already sent");
              done();
            });
        });
        it("should return an error because there's no access_token in the headers and status 401", (done) => {
          request(app)
            .post(`/friends/request/${user_two["id"]}`)
            .end((err, res) => {
              expect(res.statusCode).toEqual(401);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("Not Authorized");
              done();
            });
        });
      });
    });
  });

  describe("POST /friends/approve/:UserId", () => {
    describe("success process", () => {
      describe("approve friend request", () => {
        it("should return the data of the accepted friend request and status 201", (done) => {
          request(app)
            .post(`/friends/approve/${user_one["id"]}`)
            .set("access_token", user_two["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(201);
              expect(res.body).toHaveProperty(
                "message",
                "Friend request accepted"
              );
              expect(res.body.data).toHaveProperty("id", expect.any(Number));
              expect(res.body.data).toHaveProperty("UserId", user_two.id);
              expect(res.body.data).toHaveProperty("FriendId", user_one.id);
              expect(res.body.data).toHaveProperty("status", "accepted");
              done();
            });
        });
      });
    });

    describe("error process", () => {
      describe("attemp to approve a friend request", () => {
        it("should return an error because FriendId is not found", (done) => {
          request(app)
            .post(`/friends/approve/${String(999999999)}`)
            .set("access_token", user_two["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(404);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("User with that id not found");
              done();
            });
        });
        it("should return an error because there's no access_token in the headers and status 401", (done) => {
          request(app)
            .post(`/friends/approve/${user_two["id"]}`)
            .end((err, res) => {
              expect(res.statusCode).toEqual(401);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("Not Authorized");
              done();
            });
        });
      });
    });
  });

  describe("GET /friends/approve", () => {
    describe("success process", () => {
      describe("fetch accepted friend request", () => {
        it("should return all of the accepted friend request data and status 200", (done) => {
          request(app)
            .get(`/friends/approve/`)
            .set("access_token", user_two["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(200);
              expect(res.body).toHaveProperty(
                "message",
                "Successfully fetched friends data"
              );
              expect(res.body.data[0]).toHaveProperty("id", expect.any(Number));
              expect(res.body.data[0]).toHaveProperty("UserId", user_one.id);
              expect(res.body.data[0]).toHaveProperty("FriendId", user_two.id);
              expect(res.body.data[0]).toHaveProperty("status", "accepted");
              done();
            });
        });
      });
    });

    describe("error process", () => {
      describe("attemp to fetch approved friend request data", () => {
        it("should return an error because there's no access_token in the headers and status 401", (done) => {
          request(app)
            .get(`/friends/approve/`)
            .end((err, res) => {
              expect(res.statusCode).toEqual(401);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("Not Authorized");
              done();
            });
        });
      });
    });
  });

  describe("POST /friends/reject/:UserId", () => {
    describe("success process", () => {
      describe("reject sent friend request if status === pending", () => {
        it("should return the rejected friend data and 200 status", (done) => {
          request(app)
            .post(`/friends/reject/${user_one["id"]}`)
            .set("access_token", user_three["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(200);
              expect(res.body).toHaveProperty(
                "message",
                "Friend request rejected"
              );
              expect(res.body.data).toHaveProperty("UserId", user_one.id);
              expect(res.body.data).toHaveProperty("FriendId", user_three.id);
              done();
            });
        });
      });
    });

    describe("error process", () => {
      describe("attemp to fetch approved friend request data", () => {
        it("should return an error because there's you cannot reject an accepted friend request and status 400", (done) => {
          request(app)
            .post(`/friends/reject/${user_one["id"]}`)
            .set("access_token", user_two["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(400);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain(
                "Cannot reject accepted friend request"
              );
              done();
            });
        });

        it("should return an error because there's no access_token in the headers and status 401", (done) => {
          request(app)
            .post(`/friends/reject/${user_one["id"]}`)
            .end((err, res) => {
              expect(res.statusCode).toEqual(401);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("Not Authorized");
              done();
            });
        });
      });
    });
  });
});
