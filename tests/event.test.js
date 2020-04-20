const request = require("supertest");
const { getToken } = require("../helpers/jwt");
const app = require("../app");
const { User, Tag, sequelize } = require("../models");
const { queryInterface } = sequelize;

let access_token;
let eventId;
let tags = [];
let expired_access_token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzY3LCJlbWFpbCI6InJhbWFAZ21haWwuY29tIiwiZmlyc3RuYW1lIjoicmFtYSIsImxhc3RuYW1lIjoiZGVzaSIsInBob3RvX3VybCI6Imh0dHBzOi8vaW1hZ2VzLnVuc3BsYXNoLmNvbS9waG90by0xNDk0NzkwMTA4Mzc3LWJlOWMyOWIyOTMzMD9peGxpYj1yYi0xLjIuMSZpeGlkPWV5SmhjSEJmYVdRaU9qRXlNRGQ5JmF1dG89Zm9ybWF0JmZpdD1jcm9wJnc9MTg2OCZxPTgwIiwiaWF0IjoxNTg3Mjg1NjIxfQ.AmG300BbrDGV6f7aQ6am-3Z5h4nu70ryELY8gmWhSKw";

const eventImage = `${__dirname}/eventImage.jpeg`;

beforeAll((done) => {
  const input = {
    firstname: "Rama",
    lastname: "Desi",
    email: "ramadesy.saragih@gmail.com",
    password: "desi123",
    photo_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
  };
  User.create(input)
    .then((user) => {
      return User.findOne({
        where: {
          id: user.id,
        },
      });
    })
    .then((user) => {
      access_token = getToken({ id: user.id });
      const data = [{ name: "Tech" }, { name: "Photography" }];
      Tag.bulkCreate(data).then((result) => {
        result.forEach((el) => {
          tags.push(el.id);
        });
        tags = JSON.stringify(tags);
        done();
      });
    });
});

afterAll((done) => {
  queryInterface
    .bulkDelete("Events", {})
    .then((_) => {
      done();
    })
    .catch((err) => done(err));
});

afterAll((done) => {
  queryInterface
    .bulkDelete("Users", {})
    .then((_) => {
      done();
    })
    .catch((err) => done(err));
});

describe("Events Endpoints", () => {
  describe("success process", () => {
    describe("get events", () => {
      it("should return an object events and status 200", (done) => {
        request(app)
          .get("/events")
          .set("access_token", access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("events", expect.any(Array));
            done();
          });
      });
    });
    describe("create event", () => {
      it("should create a new event", (done) => {
        request(app)
          .post(`/events`)
          .set("access_token", access_token)
          .attach("image", eventImage, {
            contentType: "application/octet-stream",
          })
          .field("name", "Mabar DOTA 2")
          .field("category", "game")
          .field("description", "Mabar DOTA 2 area Jakarta")
          .field("max_attendees", 10)
          .field("location", "Jakarta")
          .field("date_time", "2020-05-10 11:00")
          .field("tags", tags)
          .end((err, res) => {
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty("event");
            expect(res.body.event).toHaveProperty("name", "Mabar DOTA 2");
            expect(res.body.event).toHaveProperty("category", "game");
            expect(res.body.event).toHaveProperty(
              "description",
              "Mabar DOTA 2 area Jakarta"
            );
            expect(res.body.event).toHaveProperty("image_url");
            expect(res.body.event).toHaveProperty("max_attendees", 10);
            expect(res.body.event).toHaveProperty("location", "Jakarta");
            expect(res.body.event).toHaveProperty("date_time");
            expect(res.body.event).toHaveProperty("EventTags");
            eventId = res.body.event.id;
            done();
          });
      });
    });
    describe("Get one event success", () => {
      it("should fetch a single event", (done) => {
        request(app)
          .get(`/events/${eventId}`)
          .set("access_token", access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("event");
            expect(res.body.event).toHaveProperty("name", "Mabar DOTA 2");
            expect(res.body.event).toHaveProperty("category", "game");
            expect(res.body.event).toHaveProperty(
              "description",
              "Mabar DOTA 2 area Jakarta"
            );
            expect(res.body.event).toHaveProperty("image_url");
            expect(res.body.event).toHaveProperty("max_attendees", 10);
            expect(res.body.event).toHaveProperty("location", "Jakarta");
            expect(res.body.event).toHaveProperty("date_time");
            expect(res.body.event).toHaveProperty("EventTags");
            done();
          });
      });
    });

    describe("update event with image", () => {
      it("should update a event with image", (done) => {
        request(app)
          .patch(`/events/${eventId}`)
          .set("access_token", access_token)
          .attach("image", eventImage, {
            contentType: "application/octet-stream",
          })
          .field("name", "Mabar DOTA 2")
          .field("category", "game")
          .field("description", "Mabar DOTA 2 area Jakarta Barat")
          .field("max_attendees", 100)
          .field("location", "Jakarta Barat")
          .field("date_time", "2020-05-10 10:00")
          .field("tags", tags)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("event");
            expect(res.body.event).toHaveProperty("name", "Mabar DOTA 2");
            expect(res.body.event).toHaveProperty("category", "game");
            expect(res.body.event).toHaveProperty(
              "description",
              "Mabar DOTA 2 area Jakarta Barat"
            );
            expect(res.body.event).toHaveProperty("image_url");
            expect(res.body.event).toHaveProperty("max_attendees", 100);
            expect(res.body.event).toHaveProperty("location", "Jakarta Barat");
            expect(res.body.event).toHaveProperty("date_time");
            expect(res.body.event).toHaveProperty("EventTags");
            done();
          });
      });
    });

    describe("update event without image", () => {
      it("should update event without image", (done) => {
        request(app)
          .patch(`/events/${eventId}`)
          .set("access_token", access_token)
          .field("name", "Mabar DOTA 2")
          .field("category", "game")
          .field("description", "Mabar DOTA 2 area Jakarta Barat")
          .field("max_attendees", 100)
          .field("location", "Jakarta Barat")
          .field("date_time", "2020-05-10 10:00")
          .field("tags", tags)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("event");
            expect(res.body.event).toHaveProperty("name", "Mabar DOTA 2");
            expect(res.body.event).toHaveProperty("category", "game");
            expect(res.body.event).toHaveProperty(
              "description",
              "Mabar DOTA 2 area Jakarta Barat"
            );
            expect(res.body.event).toHaveProperty("image_url");
            expect(res.body.event).toHaveProperty("max_attendees", 100);
            expect(res.body.event).toHaveProperty("location", "Jakarta Barat");
            expect(res.body.event).toHaveProperty("date_time");
            expect(res.body.event).toHaveProperty("EventTags");
            done();
          });
      });
    });

    describe("Delete one event success", () => {
      it("should delete a single event", (done) => {
        request(app)
          .delete(`/events/${eventId}`)
          .set("access_token", access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200);
            done();
          });
      });
    });
  });
  describe("error process", () => {
    describe("create event authentication error", () => {
      it("should return authentication error", (done) => {
        request(app)
          .post(`/events`)
          .attach("image", eventImage, {
            contentType: "application/octet-stream",
          })
          .field("name", "Mabar DOTA 2")
          .field("category", "game")
          .field("description", "Mabar DOTA 2 area Jakarta")
          .field("max_attendees", 10)
          .field("location", "Jakarta")
          .field("date_time", "2020-05-10 10:00")
          .field("tags", tags)
          .end((err, res) => {
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty("errors", expect.any(Array));
            expect(res.body.errors).toContain("Not Authorized");
            expect(res.body.errors.length).toBeGreaterThan(0);
            done();
          });
      });
    });
    describe("create event", () => {
      it("should return validation error", (done) => {
        request(app)
          .post(`/events`)
          .set("access_token", access_token)
          .attach("image", eventImage, {
            contentType: "application/octet-stream",
          })
          .field("category", "game")
          .field("description", "Mabar DOTA 2 area Jakarta")
          .field("max_attendees", 10)
          .field("location", "Jakarta")
          .field("date_time", "2020-05-10 10:00")
          .field("tags", tags)
          .end((err, res) => {
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("errors", expect.any(Array));
            expect(res.body.errors).toContain("Event name cannot be empty");
            expect(res.body.errors.length).toBeGreaterThan(0);
            done();
          });
      });
    });
    describe("create event", () => {
      it("should return date validation error", (done) => {
        request(app)
          .post(`/events`)
          .set("access_token", access_token)
          .attach("image", eventImage, {
            contentType: "application/octet-stream",
          })
          .field("name", "Mabar DOTA 2")
          .field("category", "game")
          .field("description", "Mabar DOTA 2 area Jakarta")
          .field("max_attendees", 10)
          .field("location", "Jakarta")
          .field("date_time", "2019-05-10 10:00")
          .field("tags", tags)
          .end((err, res) => {
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("errors", expect.any(Array));
            expect(res.body.errors).toContain(
              "You must select date/time in the future"
            );
            expect(res.body.errors.length).toBeGreaterThan(0);
            done();
          });
      });
    });
    describe("create event", () => {
      it("should return date validation error", (done) => {
        request(app)
          .post(`/events`)
          .set("access_token", access_token)
          .attach("image", eventImage, {
            contentType: "application/octet-stream",
          })
          .field("name", "Mabar DOTA 2")
          .field("category", "game")
          .field("description", "Mabar DOTA 2 area Jakarta")
          .field("max_attendees", 10)
          .field("location", "Jakarta")
          .field("tags", tags)
          .end((err, res) => {
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("errors", expect.any(Array));
            expect(res.body.errors).toContain("Date/time cannot be empty");
            expect(res.body.errors.length).toBeGreaterThan(0);
            done();
          });
      });
    });

    describe("Get one event error", () => {
      it("should return error not found", (done) => {
        request(app)
          .get(`/events/0`)
          .set("access_token", access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty("errors", expect.any(Array));
            expect(res.body.errors).toContain("Event Not Found");
            expect(res.body.errors.length).toBeGreaterThan(0);
            done();
          });
      });
    });
    describe("Delete one event error not found", () => {
      it("should return error not found", (done) => {
        request(app)
          .delete(`/events/${eventId + 1}`)
          .set("access_token", access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty("errors", expect.any(Array));
            expect(res.body.errors).toContain("Event Not Found");
            expect(res.body.errors.length).toBeGreaterThan(0);
            done();
          });
      });
    });
    describe("Get one event error Not Authorized", () => {
      it("should return error Not Authorized", (done) => {
        request(app)
          .get(`/events/${eventId}`)
          .set("access_token", expired_access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty("errors", expect.any(Array));
            expect(res.body.errors).toContain("Not Authorized");
            expect(res.body.errors.length).toBeGreaterThan(0);
            done();
          });
      });
    });
  });
});
