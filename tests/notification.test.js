// import from node_modules
const request = require("supertest");

// import from local
const { getToken } = require("../helpers/jwt");
const app = require("../app");
const { User, sequelize, Notification, Event } = require("../models");
const { queryInterface } = sequelize;

// initialization and cleaning up
let notification_user = {
  firstname: "notification",
  lastname: "test",
  email: "notificationtest@gmail.com",
  password: "notification",
  photo_url:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
};

let notification_event = {
  name: "notification event",
  category: "meetup",
  description: "notification description",
  max_attendees: 4,
  image_url:
    "https://images-na.ssl-images-amazon.com/images/I/81qy%2BMXuxDL._AC_SL1392_.jpg",
  location: "Jakarta",
  date_time: "2020-05-10 11:00",
};

let notification_test = {};

beforeAll((done) => {
  User.create(notification_user)
    .then(({ id }) => {
      notification_user["id"] = id;
      notification_user["access_token"] = getToken({ id });
      notification_event["UserId"] = notification_user["id"];
      return Event.create(notification_event);
    })
    .then(({ id }) => {
      notification_event["id"] = id;
    })
    .catch(done)
    .finally((_) => done());
});

afterAll((done) => {
  queryInterface
    .bulkDelete("Notifications", {})
    .then((_) => {
      return queryInterface.bulkDelete("Users", {});
    })
    .catch(done)
    .finally((_) => done());
});

// main
describe("Notification routes", () => {
  describe("GET /notifications", () => {
    describe("success process", () => {
      describe("get notifications for that user", () => {
        it("should return an array of Notification and status 200", (done) => {
          request(app)
            .get("/notifications")
            .set("access_token", notification_user["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(200);
              expect(res.body).toHaveProperty(
                "message",
                "Successfully fetched Notifications data"
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
            .get("/notifications")
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

  describe("POST /notifications", () => {
    describe("success process", () => {
      describe("create a new Notification", () => {
        it("should return the new notification and status 201", (done) => {
          request(app)
            .post("/notifications")
            .set("access_token", notification_user["access_token"])
            .send({
              UserId: notification_user["id"],
              EventId: notification_event["id"],
            })
            .end((err, res) => {
              expect(res.statusCode).toEqual(201);
              expect(res.body).toHaveProperty(
                "message",
                "Successfully created a new Notification"
              );
              expect(res.body.data).toHaveProperty("id", expect.any(Number));
              expect(res.body.data).toHaveProperty(
                "EventId",
                notification_event["id"]
              );
              expect(res.body.data).toHaveProperty(
                "UserId",
                notification_user["id"]
              );
              expect(res.body.data).toHaveProperty(
                "message",
                expect.any(String)
              );
              // absorbed the value of the created notification for further testing
              notification_test = { ...res.body.data };
              done();
            });
        });
      });
    });
    describe("error process", () => {
      describe("Unauthorized", () => {
        it("should return an error because there's no access_token in the headers and status 401", (done) => {
          request(app)
            .post("/notifications")
            .send({
              UserId: notification_user["id"],
              EventId: notification_event["id"],
            })
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

  describe("GET /notifications/:id", () => {
    describe("success process", () => {
      describe("get a single Notification", () => {
        it("should return the searched notification and status 200", (done) => {
          request(app)
            .get(`/notifications/${notification_test["id"]}`)
            .set("access_token", notification_user["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(200);
              expect(res.body).toHaveProperty(
                "message",
                "Successfully fetched a single Notification data"
              );
              expect(res.body.data).toHaveProperty("id", expect.any(Number));
              expect(res.body.data).toHaveProperty(
                "EventId",
                notification_event["id"]
              );
              expect(res.body.data).toHaveProperty(
                "UserId",
                notification_user["id"]
              );
              expect(res.body.data).toHaveProperty(
                "message",
                expect.any(String)
              );
              done();
            });
        });
      });
    });
    describe("error process", () => {
      describe("Unauthorized", () => {
        it("should return an error because there's no access_token in the headers and status 401", (done) => {
          request(app)
            .get(`/notifications/${notification_test["id"]}`)
            .end((err, res) => {
              expect(res.statusCode).toEqual(401);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("Not Authorized");
              done();
            });
        });
      });
      describe("Not Found", () => {
        it("should return an error because there's no notification with that id and status 404", (done) => {
          request(app)
            .get(`/notifications/9999999`)
            .set("access_token", notification_user["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(404);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("Notification not found");
              done();
            });
        });
      });
    });
  });

  //   describe("POST /friends/:FriendId", () => {
  //     describe("success process", () => {
  //       describe("create a Friend", () => {
  //         it("should return the data of the newly created friend and status 201", (done) => {
  //           request(app)
  //             .post(`/friends/${user_two["id"]}`)
  //             .send({
  //               status: "pending",
  //             })
  //             .set("access_token", user_one["access_token"])
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(201);
  //               expect(res.body).toHaveProperty(
  //                 "message",
  //                 "Successfully created a new Friend"
  //               );
  //               expect(res.body.data).toHaveProperty("id", expect.any(Number));
  //               expect(res.body.data).toHaveProperty("UserId", user_one.id);
  //               expect(res.body.data).toHaveProperty("FriendId", user_two.id);
  //               expect(res.body.data).toHaveProperty("status", "pending");
  //               done();
  //             });
  //         });
  //       });
  //     });

  //     describe("error process", () => {
  //       describe("attemp to create a friend", () => {
  //         it("should return an error because status is not set", (done) => {
  //           request(app)
  //             .post(`/friends/${user_three["id"]}`)
  //             .send({
  //               status: "",
  //             })
  //             .set("access_token", user_one["access_token"])
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(400);
  //               expect(res.body).toHaveProperty("message", "Bad Request");
  //               expect(res.body).toHaveProperty("errors", expect.any(Array));
  //               expect(res.body.errors).toContain(
  //                 "Status cannot be empty",
  //                 "Status can only have 'pending' and 'accepted' value"
  //               );
  //               done();
  //             });
  //         });
  //         it("should return an error because FriendId is not found", (done) => {
  //           request(app)
  //             .post(`/friends/${String(999999999)}`)
  //             .send({
  //               status: "",
  //             })
  //             .set("access_token", user_one["access_token"])
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(404);
  //               expect(res.body).toHaveProperty("message", "Bad Request");
  //               expect(res.body).toHaveProperty("errors", expect.any(Array));
  //               expect(res.body.errors).toContain("User with that id not found");
  //               done();
  //             });
  //         });
  //         it("should return an error because friend request is already sent", (done) => {
  //           request(app)
  //             .post(`/friends/${user_two["id"]}`)
  //             .send({
  //               status: "pending",
  //             })
  //             .set("access_token", user_one["access_token"])
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(400);
  //               expect(res.body).toHaveProperty("message", "Bad Request");
  //               expect(res.body).toHaveProperty("errors", expect.any(Array));
  //               expect(res.body.errors).toContain("Friend request already sent");
  //               done();
  //             });
  //         });
  //         it("should return an error because there's no access_token in the headers and status 401", (done) => {
  //           request(app)
  //             .post(`/friends/${user_two["id"]}`)
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(401);
  //               expect(res.body).toHaveProperty("message", "Bad Request");
  //               expect(res.body).toHaveProperty("errors", expect.any(Array));
  //               expect(res.body.errors).toContain("Not Authorized");
  //               done();
  //             });
  //         });
  //       });
  //     });
  //   });

  //   describe("GET /friends/request", () => {
  //     describe("success process", () => {
  //       describe("fetch friend requests", () => {
  //         it("should return the data of friend request(status === pending) and status 200", (done) => {
  //           request(app)
  //             .get(`/friends/request`)
  //             .set("access_token", user_two["access_token"])
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(200);
  //               expect(res.body).toHaveProperty(
  //                 "message",
  //                 "Successfully fetched friends data"
  //               );
  //               expect(res.body).toHaveProperty("data", expect.any(Array));
  //               expect(res.body.data[0]).toHaveProperty("id", expect.any(Number));
  //               expect(res.body.data[0]).toHaveProperty("UserId", user_one.id);
  //               expect(res.body.data[0]).toHaveProperty("FriendId", user_two.id);
  //               expect(res.body.data[0]).toHaveProperty("status", "pending");
  //               done();
  //             });
  //         });
  //       });
  //     });

  //     describe("error process", () => {
  //       describe("attemp to fetch friend request data", () => {
  //         it("should return an error because there's no access_token in the headers and status 401", (done) => {
  //           request(app)
  //             .get(`/friends/${user_two["id"]}`)
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(401);
  //               expect(res.body).toHaveProperty("message", "Bad Request");
  //               expect(res.body).toHaveProperty("errors", expect.any(Array));
  //               expect(res.body.errors).toContain("Not Authorized");
  //               done();
  //             });
  //         });
  //       });
  //     });
  //   });

  //   describe("POST /friends/request/:FriendId", () => {
  //     describe("success process", () => {
  //       describe("send friend requests", () => {
  //         it("should return the data of the friend request and status 201", (done) => {
  //           request(app)
  //             .post(`/friends/request/${user_three["id"]}`)
  //             .set("access_token", user_one["access_token"])
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(201);
  //               expect(res.body).toHaveProperty("message", "Friend request sent");
  //               expect(res.body.data).toHaveProperty("id", expect.any(Number));
  //               expect(res.body.data).toHaveProperty("UserId", user_one.id);
  //               expect(res.body.data).toHaveProperty("FriendId", user_three.id);
  //               expect(res.body.data).toHaveProperty("status", "pending");
  //               done();
  //             });
  //         });
  //       });
  //     });

  //     describe("error process", () => {
  //       describe("attemp to send a friend request", () => {
  //         it("should return an error because FriendId is not found", (done) => {
  //           request(app)
  //             .post(`/friends/request/${String(999999999)}`)
  //             .set("access_token", user_one["access_token"])
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(404);
  //               expect(res.body).toHaveProperty("message", "Bad Request");
  //               expect(res.body).toHaveProperty("errors", expect.any(Array));
  //               expect(res.body.errors).toContain("User with that id not found");
  //               done();
  //             });
  //         });
  //         it("should return an error because friend request is already sent", (done) => {
  //           request(app)
  //             .post(`/friends/request/${user_three["id"]}`)
  //             .set("access_token", user_one["access_token"])
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(400);
  //               expect(res.body).toHaveProperty("message", "Bad Request");
  //               expect(res.body).toHaveProperty("errors", expect.any(Array));
  //               expect(res.body.errors).toContain("Friend request already sent");
  //               done();
  //             });
  //         });
  //         it("should return an error because there's no access_token in the headers and status 401", (done) => {
  //           request(app)
  //             .post(`/friends/request/${user_two["id"]}`)
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(401);
  //               expect(res.body).toHaveProperty("message", "Bad Request");
  //               expect(res.body).toHaveProperty("errors", expect.any(Array));
  //               expect(res.body.errors).toContain("Not Authorized");
  //               done();
  //             });
  //         });
  //       });
  //     });
  //   });

  //   describe("POST /friends/approve/:UserId", () => {
  //     describe("success process", () => {
  //       describe("approve friend request", () => {
  //         it("should return the data of the accepted friend request and status 201", (done) => {
  //           request(app)
  //             .post(`/friends/approve/${user_one["id"]}`)
  //             .set("access_token", user_two["access_token"])
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(201);
  //               expect(res.body).toHaveProperty(
  //                 "message",
  //                 "Friend request accepted"
  //               );
  //               expect(res.body.data).toHaveProperty("id", expect.any(Number));
  //               expect(res.body.data).toHaveProperty("UserId", user_two.id);
  //               expect(res.body.data).toHaveProperty("FriendId", user_one.id);
  //               expect(res.body.data).toHaveProperty("status", "accepted");
  //               done();
  //             });
  //         });
  //       });
  //     });

  //     describe("error process", () => {
  //       describe("attemp to approve a friend request", () => {
  //         it("should return an error because FriendId is not found", (done) => {
  //           request(app)
  //             .post(`/friends/approve/${String(999999999)}`)
  //             .set("access_token", user_two["access_token"])
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(404);
  //               expect(res.body).toHaveProperty("message", "Bad Request");
  //               expect(res.body).toHaveProperty("errors", expect.any(Array));
  //               expect(res.body.errors).toContain("User with that id not found");
  //               done();
  //             });
  //         });
  //         it("should return an error because there's no access_token in the headers and status 401", (done) => {
  //           request(app)
  //             .post(`/friends/approve/${user_two["id"]}`)
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(401);
  //               expect(res.body).toHaveProperty("message", "Bad Request");
  //               expect(res.body).toHaveProperty("errors", expect.any(Array));
  //               expect(res.body.errors).toContain("Not Authorized");
  //               done();
  //             });
  //         });
  //       });
  //     });
  //   });

  //   describe("GET /friends/approve", () => {
  //     describe("success process", () => {
  //       describe("fetch accepted friend request", () => {
  //         it("should return all of the accepted friend request data and status 200", (done) => {
  //           request(app)
  //             .get(`/friends/approve/`)
  //             .set("access_token", user_two["access_token"])
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(200);
  //               expect(res.body).toHaveProperty(
  //                 "message",
  //                 "Successfully fetched friends data"
  //               );
  //               expect(res.body.data[0]).toHaveProperty("id", expect.any(Number));
  //               expect(res.body.data[0]).toHaveProperty("UserId", user_one.id);
  //               expect(res.body.data[0]).toHaveProperty("FriendId", user_two.id);
  //               expect(res.body.data[0]).toHaveProperty("status", "accepted");
  //               done();
  //             });
  //         });
  //       });
  //     });

  //     describe("error process", () => {
  //       describe("attemp to fetch approved friend request data", () => {
  //         it("should return an error because there's no access_token in the headers and status 401", (done) => {
  //           request(app)
  //             .get(`/friends/approve/`)
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(401);
  //               expect(res.body).toHaveProperty("message", "Bad Request");
  //               expect(res.body).toHaveProperty("errors", expect.any(Array));
  //               expect(res.body.errors).toContain("Not Authorized");
  //               done();
  //             });
  //         });
  //       });
  //     });
  //   });

  //   describe("POST /friends/reject/:UserId", () => {
  //     describe("success process", () => {
  //       describe("reject sent friend request if status === pending", () => {
  //         it("should return the rejected friend data and 200 status", (done) => {
  //           request(app)
  //             .post(`/friends/reject/${user_one["id"]}`)
  //             .set("access_token", user_three["access_token"])
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(200);
  //               expect(res.body).toHaveProperty(
  //                 "message",
  //                 "Friend request rejected"
  //               );
  //               expect(res.body.data).toHaveProperty("UserId", user_one.id);
  //               expect(res.body.data).toHaveProperty("FriendId", user_three.id);
  //               done();
  //             });
  //         });
  //       });
  //     });

  //     describe("error process", () => {
  //       describe("attemp to fetch approved friend request data", () => {
  //         it("should return an error because there's you cannot reject an accepted friend request and status 400", (done) => {
  //           request(app)
  //             .post(`/friends/reject/${user_one["id"]}`)
  //             .set("access_token", user_two["access_token"])
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(400);
  //               expect(res.body).toHaveProperty("message", "Bad Request");
  //               expect(res.body).toHaveProperty("errors", expect.any(Array));
  //               expect(res.body.errors).toContain(
  //                 "Cannot reject accepted friend request"
  //               );
  //               done();
  //             });
  //         });

  //         it("should return an error because there's no access_token in the headers and status 401", (done) => {
  //           request(app)
  //             .post(`/friends/reject/${user_one["id"]}`)
  //             .end((err, res) => {
  //               expect(res.statusCode).toEqual(401);
  //               expect(res.body).toHaveProperty("message", "Bad Request");
  //               expect(res.body).toHaveProperty("errors", expect.any(Array));
  //               expect(res.body.errors).toContain("Not Authorized");
  //               done();
  //             });
  //         });
  //       });
  //     });
  //   });
});
