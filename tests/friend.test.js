// import from node_modules
const request = require("supertest");

// import from local
const { getToken } = require("../helpers/jwt");
const app = require("../app");
const { User, sequelize } = require("../models");
const { queryInterface } = sequelize;

// initialization and cleaning up
let user_one;
let user_two;
let user_three;

beforeAll((done) => {
  user_one = {
    firstname: "Test",
    lastname: "One",
    email: "testone@gmail.com",
    password: "password1",
    photo_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
  };
  user_two = {
    firstname: "Test",
    lastname: "Two",
    email: "testtwo@gmail.com",
    password: "password2",
    photo_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
  };
  user_three = {
    firstname: "Test",
    lastname: "Three",
    email: "testthree@gmail.com",
    password: "password3",
    photo_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
  };
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
      done();
    });
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
            .set("access_token", user_one["access_token"])
            .end((err, res) => {
              expect(res.statusCode).toEqual(200);
              expect(res.body).toHaveProperty("data", expect.any(Array));
              done();
            });
        });
      });
    });
    describe("error process", () => {
      it("should return an error because there's no access_token in the headers and status 401", (done) => {
        request(app)
          .get("/friends")
          .end((err, res) => {
            console.log(err, "THIS IS ERROR");
            expect(res.status).toEqual(401);
            expect(res.body).toHaveProperty("message", "Bad Request");
            expect(res.body).toHaveProperty("errors", expect.any(Array));
            expect(res.body.errors).toContain("Not Authorized");
            done();
          });
      });
    });
  });
  // describe("POST /register", () => {
  //   describe("success process", () => {
  //     it("should create new user and return access_token and user data", (done) => {
  //       const input = {
  //         firstname: "Rama",
  //         lastname: "Desi",
  //         email: "ramadesy.saragih@gmail.com",
  //         password: "desi123",
  //         photo_url:
  //           "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
  //       };
  //       request(app)
  //         .post("/register")
  //         .send(input)
  //         .end((err, res) => {
  //           expect(err).toBe(null);
  //           expect(res.status).toBe(201);
  //           expect(res.body.user).toHaveProperty("id", expect.any(Number));
  //           expect(res.body.user).toHaveProperty("firstname", input.firstname);
  //           expect(res.body.user).toHaveProperty("lastname", input.lastname);
  //           expect(res.body.user).toHaveProperty("email", input.email);
  //           expect(res.body.user).toHaveProperty("photo_url", input.photo_url);
  //           expect(res.body).toHaveProperty("access_token", expect.any(String));
  //           UserId = res.body.user.id;
  //           done();
  //         });
  //     });
  //   });
  //   describe("error process", () => {
  //     test("should send an error with status 400 because of missing email value", (done) => {
  //       const input = {
  //         firstname: "Rama",
  //         lastname: "Desi",
  //         password: "desi123",
  //         photo_url:
  //           "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
  //       };
  //       request(app)
  //         .post("/register")
  //         .send(input)
  //         .end((err, res) => {
  //           expect(res.status).toBe(400);
  //           expect(res.body).toHaveProperty("errors", expect.any(Array));
  //           expect(res.body.errors).toContain("Email cannot be empty");
  //           expect(res.body.errors.length).toBeGreaterThan(0);
  //           done();
  //         });
  //     });
  //     test("should send an error with status 400 because password min 6 validation", (done) => {
  //       const input = {
  //         firstname: "Rama",
  //         lastname: "Desi",
  //         email: "ramadesy.saragih@gmail.com",
  //         password: "desi",
  //         photo_url:
  //           "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
  //       };
  //       request(app)
  //         .post("/register")
  //         .send(input)
  //         .end((err, res) => {
  //           expect(err).toBe(null);
  //           expect(res.body).toHaveProperty("errors", expect.any(Array));
  //           expect(res.body.errors).toContain(
  //             "Password must at least 6 characters"
  //           );
  //           expect(res.body.errors.length).toBeGreaterThan(0);
  //           expect(res.status).toBe(400);
  //           done();
  //         });
  //     });
  //     test("should return an error due to email in not unique", (done) => {
  //       const input = {
  //         firstname: "Rama",
  //         lastname: "Desi",
  //         email: "ramadesy.saragih@gmail.com",
  //         password: "desi123",
  //         photo_url:
  //           "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
  //       };
  //       request(app)
  //         .post("/register")
  //         .send(input)
  //         .end((err, res) => {
  //           expect(err).toBe(null);
  //           expect(res.status).toBe(400);
  //           expect(res.body).toHaveProperty("errors", expect.any(Array));
  //           expect(res.body.errors).toContain("email must be unique");
  //           done();
  //         });
  //     });
  //   });
  // });
  // describe("POST /login", () => {
  //   describe("success process", () => {
  //     test("it should return access token, message and status 200 ", (done) => {
  //       const input = {
  //         email: "ramadesy.saragih@gmail.com",
  //         password: "desi123",
  //       };
  //       request(app)
  //         .post("/login")
  //         .send(input)
  //         .end((err, res) => {
  //           token = res.body.token;
  //           expect(err).toBe(null);
  //           expect(res.status).toBe(200);
  //           expect(res.body.user).toHaveProperty("id", expect.any(Number));
  //           expect(res.body.user).toHaveProperty("firstname", "Rama");
  //           expect(res.body.user).toHaveProperty("lastname", "Desi");
  //           expect(res.body.user).toHaveProperty(
  //             "email",
  //             "ramadesy.saragih@gmail.com"
  //           );
  //           expect(res.body.user).toHaveProperty(
  //             "photo_url",
  //             "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80"
  //           );
  //           expect(res.body).toHaveProperty("access_token", expect.any(String));
  //           access_token = res.body.access_token;
  //           done();
  //         });
  //     });
  //   });

  //   describe("error process", () => {
  //     describe("error process due to wrong email", () => {
  //       test("it should return login failed error and status 400", (done) => {
  //         const input = {
  //           email: "ramadesi@admin.com",
  //           password: "desi123",
  //         };
  //         request(app)
  //           .post("/login")
  //           .send(input)
  //           .end((err, res) => {
  //             expect(err).toBe(null);
  //             expect(res.body).toHaveProperty("errors", expect.any(Array));
  //             expect(res.body.errors).toContain(
  //               "Please input correct email/password"
  //             );
  //             expect(res.status).toBe(400);
  //             done();
  //           });
  //       });
  //     });
  //     describe("error process due to wrong password", () => {
  //       test("it should return login failed error and status 400", (done) => {
  //         const input = {
  //           email: "ramadesy.saragih@gmail.com",
  //           password: "desi1231",
  //         };
  //         request(app)
  //           .post("/login")
  //           .send(input)
  //           .end((err, res) => {
  //             expect(err).toBe(null);
  //             expect(res.body).toHaveProperty("errors", expect.any(Array));
  //             expect(res.body.errors).toContain(
  //               "Please input correct email/password"
  //             );
  //             expect(res.status).toBe(400);
  //             done();
  //           });
  //       });
  //     });
  //   });
  // });

  // describe("GET /users/:id", () => {
  //   describe("success process", () => {
  //     describe("get users by ID", () => {
  //       it("should return an user and status 200", (done) => {
  //         request(app)
  //           .get(`/users/${UserId}`)
  //           .set("access_token", access_token)
  //           .end((err, res) => {
  //             expect(res.statusCode).toEqual(200);
  //             expect(res.body).toHaveProperty("user", expect.any(Object));
  //             done();
  //           });
  //       });
  //     });
  //   });
  //   describe("error process", () => {
  //     describe("error process due to token unavailable", () => {
  //       test("it should return error with status 401", (done) => {
  //         request(app)
  //           .get(`/users/${UserId}`)
  //           .set("access_token", "")
  //           .end((err, res) => {
  //             expect(res.statusCode).toEqual(401);
  //             expect(res.body).toHaveProperty("errors", expect.any(Array));
  //             expect(res.body.errors).toContain("Not Authorized");
  //             done();
  //           });
  //       });
  //     });
  //     describe("error process due to token unavailable", () => {
  //       test("it should return error with status 401", (done) => {
  //         request(app)
  //           .get(`/users/0`)
  //           .set("access_token", access_token)
  //           .end((err, res) => {
  //             expect(res.statusCode).toEqual(404);
  //             expect(res.body).toHaveProperty("errors", expect.any(Array));
  //             expect(res.body.errors).toContain("User Not Found");
  //             done();
  //           });
  //       });
  //     });
  //   });
  // });
});
