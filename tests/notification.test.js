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

let notification_user_edited = {
  firstname: "notification",
  lastname: "test2",
  email: "notificationtest2@gmail.com",
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

let notification_event_edited = {
  name: "notification event2",
  category: "meetup",
  description: "notification description2",
  max_attendees: 6,
  image_url:
    "https://images-na.ssl-images-amazon.com/images/I/81qy%2BMXuxDL._AC_SL1392_.jpg",
  location: "Jakarta",
  date_time: "2020-05-10 11:00",
};

let notification_event_deleted = {
  name: "notification event deleted",
  category: "meetup",
  description: "notification deleted",
  max_attendees: 6,
  image_url:
    "https://images-na.ssl-images-amazon.com/images/I/81qy%2BMXuxDL._AC_SL1392_.jpg",
  location: "Jakarta",
  date_time: "2020-05-10 11:00",
};

let notification_test = {};
let deletedId = null;

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
      return User.create(notification_user_edited);
    })
    .then(({ id }) => {
      notification_user_edited["id"] = id;
      notification_user_edited["access_token"] = getToken({ id });
      notification_event_edited["UserId"] = notification_user_edited["id"];
      return Event.create(notification_event_edited);
    })
    .then(({ id }) => {
      notification_event_edited["id"] = id;
      return Event.create(notification_event_deleted);
    })
    .then(({ id }) => {
      notification_event_deleted["id"] = id;
      return Notification.create({
        UserId: notification_user["id"],
        EventId: notification_event_deleted["id"],
        message: "Please delete",
      });
    })
    .then(({ id }) => {
      deletedId = id;
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
      describe("Not Found", () => {
        it("should return an error because EventId was not found and status 404", (done) => {
          request(app)
            .post("/notifications")
            .set("access_token", notification_user["access_token"])
            .send({
              UserId: notification_user["id"],
              EventId: 999999,
            })
            .end((err, res) => {
              expect(res.statusCode).toEqual(404);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("Event with matching EventId not found");
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

  describe("PATCH /notifications/:id", () => {
    describe("success process", () => {
      describe("Edit a single notification", () => {
        it("should return a new notification and status 200", (done) => {
          request(app)
            .patch(`/notifications/${notification_test["id"]}`)
            .set("access_token", notification_user["access_token"])
            .send({
              UserId: notification_user_edited["id"],
              EventId: notification_event_edited["id"],
              message: "Edited message",
            })
            .end((err, res) => {
              expect(res.statusCode).toEqual(200);
              expect(res.body).toHaveProperty(
                "message",
                "Successfully updated a Notification"
              );
              expect(res.body.data).toHaveProperty("id", expect.any(Number));
              expect(res.body.data).toHaveProperty(
                "EventId",
                notification_event_edited["id"]
              );
              expect(res.body.data).toHaveProperty(
                "UserId",
                notification_user_edited["id"]
              );
              expect(res.body.data).toHaveProperty("message", "Edited message");
              done();
            });
        });
      });
    });
    describe("error process", () => {
      describe("Unauthorized", () => {
        it("should return an error because there's no access_token in the headers and status 401", (done) => {
          request(app)
            .patch(`/notifications/${notification_test["id"]}`)
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
            .patch(`/notifications/999999`)
            .set("access_token", notification_user["access_token"])
            .send({
              UserId: notification_user_edited["id"],
              EventId: notification_event_edited["id"],
              message: "Edited message",
            })
            .end((err, res) => {
              expect(res.statusCode).toEqual(404);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain(
                "Event with matching EventId not found"
              );
              done();
            });
        });
      });
      describe("Bad Request", () => {
        it("should return an error because there's body does not meet the validation and status 400", (done) => {
          request(app)
            .patch(`/notifications/${notification_test["id"]}`)
            .set("access_token", notification_user["access_token"])
            .send({
              UserId: notification_user_edited["id"],
              EventId: notification_event_edited["id"],
              message: "",
            })
            .end((err, res) => {
              expect(res.statusCode).toEqual(400);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain("message cannot be empty");
              done();
            });
        });
      });
    });
  });

  describe("DELETE /notifications/:id", () => {
    describe("success process", () => {
      describe("delete a single notification", () => {
        it("should return the deleted notification and status 200", (done) => {
          request(app)
            .delete(`/notifications/${notification_test["id"]}`)
            .set("access_token", notification_user["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(200);
              expect(res.body).toHaveProperty(
                "message",
                "Notification deleted"
              );
              expect(res.body.data).toHaveProperty("id", expect.any(Number));
              expect(res.body.data).toHaveProperty(
                "EventId",
                notification_event_edited["id"]
              );
              expect(res.body.data).toHaveProperty(
                "UserId",
                notification_user_edited["id"]
              );
              expect(res.body.data).toHaveProperty("message", "Edited message");
              done();
            });
        });
      });
    });

    describe("error process", () => {
      describe("Unauthorized", () => {
        it("should return an error because there's no access_token in the headers and status 401", (done) => {
          request(app)
            .delete(`/notifications/${notification_test["id"]}`)
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
            .delete(`/notifications/999999`)
            .set("access_token", notification_user["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(404);
              expect(res.body).toHaveProperty("message", "Bad Request");
              expect(res.body).toHaveProperty("errors", expect.any(Array));
              expect(res.body.errors).toContain(
                "Event with matching EventId not found"
              );
              done();
            });
        });
      });
    });
  });
});
