const { Event, User, Tag, EventTag, Attendee } = require("../models");

class EventController {
  static findAll(req, res, next) {
    Event.findAll({
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
                res.status(201).json({
                  event: result,
                });
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
    } else {
      image_url = "";
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
                      include: [{ model: Tag }],
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
