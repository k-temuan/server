// import from node_modules
const moment_timezone = require("moment-timezone");

// import from local files
const { Event, User, Tag, EventTag, Attendee } = require("../models");
const { sendEmail } = require("../helpers/axios");

class EventController {
  static findAll(req, res, next) {
    Event.findAll({
      where: {
        status: true,
      },
      include: [
        {
          model: User,
          order: [["date_time", "DESC"]],
          attributes: ["id", "firstname", "lastname", "email", "photo_url"],
        },
        {
          model: EventTag,
          attributes: ["id", "EventId", "TagId"],
          include: [
            {
              model: Tag,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Attendee,
          include: [
            {
              model: User,
              attributes: ["id", "firstname", "lastname", "email", "photo_url"],
            },
          ],
        },
      ],
    })
      .then((events) => {
        res.status(200).json({
          events: events,
        });
      })
      .catch(next);
  }

  static create(req, res, next) {
    // initiate absorption of userData
    let userData = {};
    let image_url = null;
    if (req.body.image_url) {
      image_url = req.body.image_url;
    } else {
      image_url = req.file.path;
    }
    const {
      name,
      category,
      description,
      max_attendees,
      location,
      date_time,
      tags,
    } = req.body;
    const UserId = req.decoded.id;
    let parsedTags = JSON.parse(tags);
    User.findOne({
      where: {
        id: UserId,
      },
    })
      .then((result) => {
        userData = { ...result };
        Event.create({
          name,
          category,
          description,
          max_attendees,
          image_url,
          location,
          date_time,
          UserId,
        })
          .then((response) => {
            const eventId = response.id;
            const eventTags = [];
            parsedTags.forEach((el) => {
              let eventTag = {
                TagId: el,
                EventId: eventId,
              };
              eventTags.push(eventTag);
            });
            EventTag.bulkCreate(eventTags)
              .then((result) => {
                Event.findByPk(eventId, {
                  include: [
                    {
                      model: EventTag,
                      include: [{ model: Tag }],
                    },
                  ],
                })
                  .then((result) => {
                    // send email here
                    sendEmail.post("/mail", {
                      to: userData["dataValues"]["email"],
                      subject: `You just created a new Event`,
                      html: `
                    <div style="box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2); transition: 0.3s;">
                      <img src="${
                        result.image_url
                      }" alt="Event image" style="width:100%">
                    <div style="padding: 2px 16px;">
                    <h2><b>
                    ${userData["dataValues"]["firstname"]} ${
                        userData["dataValues"]["lastname"]
                      }</b></h2>
                      <p>You successfully created a new Event.</p>
                      <p>The details are:</p>
                      <ul>
                        <li>Name        : ${result["dataValues"]["name"]}</li>
                        <li>Category    : ${
                          result["dataValues"]["category"]
                        }</li>
                        <li>Description : ${
                          result["dataValues"]["description"]
                        }</li>
                        <li>Location    : ${
                          result["dataValues"]["location"]
                        }</li>
                        <li>Date/Time   : ${moment_timezone(result.date_time)
                          .tz("Asia/Jakarta")
                          .format("l")}</li>
                      </ul>
                      <p>Remember to invite your friends and wait patiently :)</p>
                    </div>
                    <img src="https://k-temuan.herokuapp.com/public/logo.png" alt="Footer Logo" style="width:100%">
                    </div>       
                   `,
                      company: "K-temuan",
                      sendername: "K-temuan Reminder Bot",
                    });
                    res.status(201).json({
                      event: result,
                    });
                  })
                  .catch(next);
              })
              .catch(next);
          })
          .catch(next);
      })
      .catch(next);
  }
  static findById(req, res, next) {
    Event.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ["id", "firstname", "lastname", "email", "photo_url"],
        },
        {
          model: EventTag,
          attributes: ["id", "EventId", "TagId"],
          include: [
            {
              model: Tag,
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Attendee,
          include: [
            {
              model: User,
              attributes: ["id", "firstname", "lastname", "email", "photo_url"],
            },
          ],
        },
      ],
    })
      .then((response) => {
        if (response) {
          res.status(200).json({
            event: response,
          });
        } else {
          let err = {
            name: "custom",
            status: 404,
            message: "Event Not Found",
          };
          next(err);
        }
      })
      .catch(next);
  }
  static update(req, res, next) {
    let image_url;
    if (req.file) {
      image_url = req.file.path;
    }

    const EventId = req.params.id;
    const {
      name,
      category,
      description,
      max_attendees,
      location,
      date_time,
      tags,
    } = req.body;
    let parsedTags = JSON.parse(tags);

    const UserId = req.decoded.id;

    if (image_url) {
      Event.update(
        {
          name,
          category,
          description,
          max_attendees,
          image_url,
          location,
          date_time,
          UserId,
        },
        {
          where: {
            id: EventId,
          },
        }
      )
        .then((updated) => {
          EventTag.destroy({ where: { EventId } })
            .then((result) => {
              const newTags = [];
              parsedTags.forEach((el) => {
                const newTag = {
                  TagId: el,
                  EventId,
                };
                newTags.push(newTag);
              });
              EventTag.bulkCreate(newTags)
                .then((result) => {
                  Event.findByPk(EventId, {
                    include: [
                      {
                        model: EventTag,
                        include: [{ model: Tag }, Attendee, User],
                      },
                    ],
                  })
                    .then((result) => {
                      res.status(200).json({
                        event: result,
                      });
                    })
                    .catch(next);
                })
                .catch(next);
            })
            .catch(next);
        })
        .catch(next);
    } else {
      Event.update(
        {
          name,
          category,
          description,
          max_attendees,
          // image_url, DISINI ENGGA ADA IMAGE URL KETIKA ENGGA DIUPLOAD GAMBARNYA
          location,
          date_time,
          UserId,
        },
        {
          where: {
            id: EventId,
          },
        }
      )
        .then((updated) => {
          EventTag.destroy({ where: { EventId } })
            .then((result) => {
              const newTags = [];
              parsedTags.forEach((el) => {
                const newTag = {
                  TagId: el,
                  EventId,
                };
                newTags.push(newTag);
              });
              EventTag.bulkCreate(newTags)
                .then((result) => {
                  Event.findByPk(EventId, {
                    include: [
                      {
                        model: EventTag,
                        include: [{ model: Tag }, Attendee, User],
                      },
                    ],
                  })
                    .then((result) => {
                      res.status(200).json({
                        event: result,
                      });
                    })
                    .catch(next);
                })
                .catch(next);
            })
            .catch(next);
        })
        .catch(next);
    }
    // // find the updated data first
    // // const EventId = req.params.id;
    // const { id: EventId } = req.params;
    // let image_url;
    // let parsedTags;
    // Event.find({
    //   where: {
    //     id: EventId,
    //   },
    // })
    //   .then((found) => {
    //     if (req.file) {
    //       image_url = req.file.path;
    //     } else {
    //       image_url = found.image_url;
    //     }
    //     const {
    //       name,
    //       category,
    //       description,
    //       max_attendees,
    //       location,
    //       date_time,
    //       tags,
    //     } = req.body;
    //     parsedTags = JSON.parse(tags);
    //     const UserId = req.decoded.id;
    //     return Event.update(
    //       {
    //         name,
    //         category,
    //         description,
    //         max_attendees,
    //         image_url,
    //         location,
    //         date_time,
    //         UserId,
    //       },
    //       {
    //         where: {
    //           id: EventId,
    //         },
    //       }
    //     );
    //   })
    //   .then((updated) => {
    //     EventTag.destroy({ where: { EventId } })
    //       .then((result) => {
    //         const newTags = [];
    //         parsedTags.forEach((el) => {
    //           const newTag = {
    //             TagId: el,
    //             EventId,
    //           };
    //           newTags.push(newTag);
    //         });
    //         EventTag.bulkCreate(newTags)
    //           .then((result) => {
    //             Event.findByPk(EventId, {
    //               include: [
    //                 {
    //                   model: EventTag,
    //                   include: [{ model: Tag }],
    //                 },
    //               ],
    //             })
    //               .then((result) => {
    //                 res.status(200).json({
    //                   event: result,
    //                 });
    //               })
    //               .catch(next);
    //           })
    //           .catch(next);
    //       })
    //       .catch(next);
    //   })
    //   .catch(next);
  }
  static delete(req, res, next) {
    let EventId = req.params.id;

    Event.destroy({
      where: {
        id: EventId,
      },
    })
      .then((result) => {
        res.status(200).json({
          data: "deleted",
        });
      })
      .catch(next);
  }
}

module.exports = EventController;
