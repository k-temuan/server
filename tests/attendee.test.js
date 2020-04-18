const request = require("supertest");
const { getToken } = require("../helpers/jwt");
const app = require("../app");
const { User, Event, Tag, sequelize } = require("../models");
const { queryInterface } = sequelize;

let access_token;
let eventId;
let tags = [];
let attendeeId;

beforeAll((done) => {
  const user_one = {
    firstname: "Rama",
    lastname: "Desi",
    email: "ramadesy.saragih@gmail.com",
    password: "desi123",
    photo_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
  };

  User.create(user_one)
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
        const event = {
          name: "Hacktiv8 Hackathon",
          category: "game",
          description: "Hackathon held by Hacktiv8 Indonesia",
          max_attendees: 1000,
          location: "Hacktiv8 Office",
          date_time: "2020-05-10 11:00",
          tags: tags,
          image_url:
            "https://cdn.pixabay.com/photo/2018/05/10/11/34/concert-3387324_960_720.jpg",
        };
        Event.create(event).then((result) => {
          eventId = result.id;
          done();
        });
      });
    });
});

afterAll((done) => {
  queryInterface
    .bulkDelete("Attendees", {})
    .then((_) => {
      return queryInterface.bulkDelete("Events", {}).then((_) => {
        return queryInterface.bulkDelete("Users", {}).then((_) => {
          done();
        });
      });
    })
    .catch((err) => done(err));
});

describe("Attendee Endpoints", () => {
  describe("success process", () => {
    describe("get attendee", () => {
      it("should return an object attendee and status 200", (done) => {
        request(app)
          .get("/attendees")
          .set("access_token", access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("attendees", expect.any(Array));
            done();
          });
      });
    });

    describe("create attendee", () => {
      it("should create a new attendee", (done) => {
        const data = {
          EventId: eventId,
        };
        request(app)
          .post(`/attendees`)
          .set("access_token", access_token)
          .send(data)
          .end((err, res) => {
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty("attendee");
            expect(res.body.attendee).toHaveProperty("Event");
            attendeeId = res.body.attendee.id;
            done();
          });
      });
    });

    describe("Get one attendee success", () => {
      it("should fetch a single attendee", (done) => {
        request(app)
          .get(`/attendees/${attendeeId}`)
          .set("access_token", access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("attendee");
            expect(res.body.attendee).toHaveProperty("Event");
            done();
          });
      });
    });

    describe("Update one attendee success", () => {
      it("should update an attendee", (done) => {
        request(app)
          .patch(`/attendees/${attendeeId}?confirm=true`)
          .set("access_token", access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("attendee");
            expect(res.body.attendee).toHaveProperty("isConfirm", true);
            done();
          });
      });
    });

    describe("Delete one attendee success", () => {
      it("should delete a single attendee", (done) => {
        request(app)
          .delete(`/attendees/${attendeeId}`)
          .set("access_token", access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200);
            done();
          });
      });
    });
  });
  describe("error process", () => {
    describe("create attendee", () => {
      it("should return validation error", (done) => {
        request(app)
          .post("/attendees")
          .set("access_token", access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("errors", expect.any(Array));
            expect(res.body.errors).toContain("Event ID cannot be empty");
            done();
          });
      });
    });

    describe("Get one attendee error", () => {
      it("should return error not found", (done) => {
        request(app)
          .get(`/attendees/0`)
          .set("access_token", access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(404);
            done();
          });
      });
    });
    describe("Delete one attendee error not found", () => {
      it("should return error not found", (done) => {
        request(app)
          .delete(`/attendees/0`)
          .set("access_token", access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(404);
            done();
          });
      });
    });
  });
});
